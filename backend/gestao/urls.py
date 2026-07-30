from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, ProjetoViewSet, TarefaViewSet, SubtarefaViewSet, PastaViewSet, ArquivoViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'projetos', ProjetoViewSet)
router.register(r'tarefas', TarefaViewSet)
router.register(r'subtarefas', SubtarefaViewSet)
router.register(r'pastas', PastaViewSet)
router.register(r'arquivos', ArquivoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]