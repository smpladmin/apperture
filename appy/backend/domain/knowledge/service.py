from fastapi import Depends
from typing import Annotated

from vectorstore import VectorStore
from rest.dtos.knowledge import FaqDto
from domain.knowledge.models import FAQ


class KnowledgeService:
    def __init__(
        self,
        vectorstore: Annotated[VectorStore, Depends()],
    ):
        self.vectorstore = vectorstore
        self.class_name = "FAQ"

    def save_faqs(self, faqs: list[FaqDto]):
        client = self.vectorstore.client
        client.batch.configure(batch_size=100)
        with client.batch as batch:
            for i, d in enumerate(faqs):
                print(f"importing faq: {i+1}")
                data = d.model_dump()
                data["text"] = f"{data['question']}\n{data['answer']}"
                batch.add_data_object(data_object=data, class_name=self.class_name)

    def get_faqs(self):
        response = (
            self.vectorstore.client.query.get(
                self.class_name,
                ["question", "answer"],
            )
            .with_additional(["id"])
            .with_limit(2000)
            .do()
        )

        faqs = response["data"]["Get"][self.class_name]
        return list(
            map(
                lambda faq: FAQ(
                    id=faq["_additional"]["id"],
                    question=faq["question"],
                    answer=faq["answer"],
                ),
                faqs,
            )
        )

    def delete_faq(self, id: str):
        return self.vectorstore.client.data_object.delete(
            uuid=id,
            class_name=self.class_name,
        )
