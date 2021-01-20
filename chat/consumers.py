import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class ChatConsumer(AsyncJsonWebsocketConsumer):


    async def connect(self):
        print('connecting.......')
        self.user_id = self.scope['url_route']['kwargs']['id']
        self.room_group_name = 'call_%s' % self.user_id

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'call_message',
                'data': data
            }
        )

    # Receive message from room group
    async def call_message(self, event):
        data = event.get('data')
        print(data)

        # Send message to WebSocket
        await self.send_json(data)