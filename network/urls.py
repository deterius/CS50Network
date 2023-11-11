
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.posts, name='posts'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # Fetch all posts by everyone
    path('like_post/<int:post_id>/', views.like_post, name='like_post'),
    path('like_count/<int:post_id>/', views.like_count, name='like_count'),
    path('new_post', views.new_post, name='new_post'),
    path('follow/<str:follow_user>', views.follow, name='follow_user'),
    path('user/<str:user>', views.user_page, name='user_page'),
    path('posts', views.posts, name='posts'),
    path('following_user_post', views.following_user_post, name='following_user_post'),
    path('stats/<str:check_user>', views.stats, name='stats'),

    

]


