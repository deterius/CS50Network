from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse

from .models import User, Post, Like, UserFollowing

from django.http import JsonResponse

from .forms import NewPost


def is_user_following(current_user, user_to_check):
    # Get the currently logged-in user or any other user object as per your requirements
    # current_user = request.user

    # Get the user object for which you want to check the following status
    # user_to_check = User.objects.get(username=user_to_check)

    # Get the UserFollowing object for the current user
    try:
        user_following = UserFollowing.objects.get(user=current_user)
    except UserFollowing.DoesNotExist:
        user_following = None

    # Check if the current user is following the user_to_check
    is_following = False
    if user_following:
        is_following = user_following.is_following(user_to_check)
        
    return is_following