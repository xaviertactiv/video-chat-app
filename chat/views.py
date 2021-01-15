from django.shortcuts import render

from rest_framework.viewsets import ViewSet


class CallView(ViewSet):

    def post(self, request):
        import pdb; pdb.set_trace()