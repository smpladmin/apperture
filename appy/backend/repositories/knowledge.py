import logging
from typing import Annotated

from fastapi import Depends
from domain.knowledge.models import FAQ

from vectorstore import VectorStore


class KnowledgeRepository:
    def __init__(self, vectorstore: Annotated[VectorStore, Depends()]) -> None:
        self.vectorestore = vectorstore

    def search_faqs(self, query: str):
        logging.info(f"==============={query}")
        response = (
            self.vectorestore.client.query.get("FAQ", ["question", "answer"])
            .with_hybrid(query=query)
            .with_additional(["id"])
            .with_limit(2)
            .do()
        )
        logging.info(f"==============={response}")

        faqs = response["data"]["Get"]["FAQ"]
        faqs = list(
            map(
                lambda faq: FAQ(
                    id=faq["_additional"]["id"],
                    question=faq["question"],
                    answer=faq["answer"],
                ),
                faqs,
            )
        )
        return faqs
