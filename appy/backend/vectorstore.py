import weaviate

from settings import appy_settings


class VectorStore:
    def __init__(self):
        self.settings = appy_settings()

    def init(self):
        self.client = weaviate.Client(
            url=self.settings.vectorstore_url,
            additional_headers={"X-OpenAI-Api-Key": self.settings.openai_api_key},
        )
        # class_obj = {
        #     "class": "FAQ",
        #     "vectorizer": "text2vec-openai",
        # }
        # self.client.schema.create_class(class_obj)

    def close(self):
        self.client._connection.close()
