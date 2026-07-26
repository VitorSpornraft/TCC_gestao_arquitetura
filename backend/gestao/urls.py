from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, TarefaViewSet, SubtarefaViewSet, PastaViewSet, ArquivoViewSet, VersaoArquivoViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'tarefas', TarefaViewSet)
router.register(r'subtarefas', SubtarefaViewSet)
router.register(r'pastas', PastaViewSet)
router.register(r'arquivos', ArquivoViewSet)
router.register(r'versoes', VersaoArquivoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]