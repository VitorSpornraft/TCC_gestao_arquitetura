from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClienteViewSet, ProjetoViewSet, TarefaViewSet, SubtarefaViewSet, 
    PastaViewSet, ArquivoViewSet, RegistrarArquitetoView, EventoViewSet,
    AtivarContaView, EsqueciSenhaView, RedefinirSenhaView, ClienteLoginView
)

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet, basename='clientes')
router.register(r'projetos', ProjetoViewSet, basename='projetos')
router.register(r'tarefas', TarefaViewSet, basename='tarefas')
router.register(r'subtarefas', SubtarefaViewSet, basename='subtarefas')
router.register(r'pastas', PastaViewSet, basename='pastas')
router.register(r'arquivos', ArquivoViewSet, basename='arquivos')
router.register(r'eventos', EventoViewSet, basename='eventos')

urlpatterns = [
    path('', include(router.urls)),
    path('registrar/', RegistrarArquitetoView.as_view(), name='registrar-arquiteto'),
    path('auth/ativar-conta/', AtivarContaView.as_view(), name='ativar-conta'),
    path('auth/esqueci-senha/', EsqueciSenhaView.as_view(), name='esqueci-senha'),
    path('auth/redefinir-senha/', RedefinirSenhaView.as_view(), name='redefinir-senha'),
    path('auth/cliente-login/', ClienteLoginView.as_view(), name='cliente-login'),
]