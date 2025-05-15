"""
Description: URL dispatcher for the web application.

Main content:
1. array: urlpatterns
"""

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authn.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)