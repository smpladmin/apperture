import aioch


class Clickhouse:
    async def init(self):
        self.client = aioch.Client(host='clickhouse')

    async def close(self):
        await self.client.disconnect()
