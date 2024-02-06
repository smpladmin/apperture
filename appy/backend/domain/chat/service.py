import json
import logging
from datetime import datetime
from typing import Annotated

from beanie import PydanticObjectId
from fastapi import Depends
from domain.chat.models import ChatSettings, Chat
from domain.knowledge.models import FAQ
from repositories.knowledge import KnowledgeRepository
from repositories.chat import ChatRepository
from rest.dtos.chat import ChatSettingsUpdate

from vectorstore import VectorStore
from openai import AsyncOpenAI


class ChatService:
    def __init__(
        self,
        knowledge_repo: Annotated[KnowledgeRepository, Depends()],
        chat_repo: Annotated[ChatRepository, Depends()],
        vectorstore: Annotated[VectorStore, Depends()],
    ):
        self.vectorstore = vectorstore
        self.knowledge_repo = knowledge_repo
        self.chat_repo = chat_repo
        self.openai_client = AsyncOpenAI()

    async def get_chat_history(self, user_id: PydanticObjectId, history_length: int):
        return (
            await Chat.find(Chat.user_id == user_id)
            .sort("-created_at")
            .limit(history_length)
            .to_list()
        )

    async def save_user_chat(
        self,
        query_id: PydanticObjectId,
        user_id: PydanticObjectId,
        question: str,
        answer: str,
    ):
        chat_obj = Chat(
            query_id=query_id, user_id=user_id, question=question, answer=answer
        )
        await Chat.insert(chat_obj)

    async def generate_response(
        self,
        question: str,
        user_id: PydanticObjectId,
    ):
        query_id = PydanticObjectId()
        logging.info(
            f"{query_id} ==============================================================="
        )
        logging.info(f"{query_id} User query: {question}")
        chat_settings = await self.get_chat_settings(user_id=user_id)

        history = await self.get_chat_history(
            user_id=user_id, history_length=chat_settings.history_length
        )
        history = [
            m
            for message in history
            for m in (
                {"role": "user", "content": message.question},
                {"role": "assistant", "content": message.answer},
            )
        ]
        logging.info(f"{query_id} History: {history}")

        faqs = self.knowledge_repo.search_faqs(query=question)
        logging.info(
            f"{query_id} Matched FAQs: {json.dumps([faq.model_dump() for faq in faqs], indent=2)}"
        )

        messages = self.assemble_messages(faqs, history, question, chat_settings)
        logging.info(f"{query_id} Final Messages: {json.dumps(messages, indent=2)}")

        answer = await self._generate(messages, query_id)
        logging.info(f"{query_id} Final Answer: {answer}")
        # await self.chat_repo.extract_and_parse_system_message(answer)
        await self.save_user_chat(
            query_id=query_id, user_id=user_id, question=question, answer=answer
        )

        logging.info(
            f"{query_id} ==============================================================="
        )
        return answer

    async def _generate(self, messages, trace_id):
        response = await self.openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=2048,
            temperature=0.2,
        )
        logging.info(
            f"{trace_id} OpenAI API response: {response.model_dump_json(indent=2)}"
        )
        return response.choices[0].message.content

    def assemble_messages(
        self,
        faqs: list[FAQ],
        history,
        question: str,
        chat_settings: ChatSettings,
    ):
        system_message = {"role": "system", "content": chat_settings.system_message}
        faqs = list(map(lambda faq: f"{faq.question}\n{faq.answer}", faqs))
        faqs_string = "\n\n".join(faqs)
        faqs_message = {
            "role": "system",
            "content": f"Here are some faqs:\n{faqs_string}",
        }
        current_message = {
            "role": "user",
            "content": question,
        }
        final_system_message = {
            "role": "system",
            "content": f"Answer in less than 30 words only",
        }
        return [
            system_message,
            faqs_message,
            *history,
            final_system_message,
            current_message,
        ]

    async def save_chat_settings(self, settings: ChatSettings):
        await ChatSettings.insert(settings)

    async def update_chat_settings(self, update: ChatSettingsUpdate):
        user_id = update.user_id
        to_update = update.model_dump(exclude_none=True)
        to_update.pop("user_id")
        to_update["updated_at"] = datetime.utcnow()
        await ChatSettings.find_one(ChatSettings.user_id == user_id).update(
            {"$set": to_update}
        )

    async def get_chat_settings(self, user_id: PydanticObjectId) -> ChatSettings:
        return await ChatSettings.find_one(ChatSettings.user_id == user_id)

    def parse_chat_answers(self, answer: str):
        return self.chat_repo.extract_and_parse_system_message(answer)
