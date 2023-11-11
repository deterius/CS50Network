from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.db.models import Count, Prefetch
from django.db import models
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
# Converts query to JSON
from django.core import serializers
from django.http import JsonResponse


from .models import User, Post, Like, UserFollowing
from . import helpers as hp
from .forms import NewPost



def index(request):
    return render(request, "network/posts.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("posts"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("posts"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("posts"))
    else:
        return render(request, "network/register.html")



def like_post(request, post_id):
    if request.method == 'POST' and request.user.is_authenticated:
        post = get_object_or_404(Post, pk=post_id)
        user = request.user
    # New version
        like, created = Like.objects.get_or_create(post=post, user=user)
        if not created:
            like.delete()
        
        likes_count = post.total_likes()  # Get the updated number of likes
        print(likes_count)

        return JsonResponse({'likes': likes_count})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

    
def like_count(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    user = request.user
    likes_count = post.total_likes()
    
    return JsonResponse({'likes_count': likes_count})


def new_post(request):
    if request.method == "POST":
        form = NewPost(request.POST)
        if form.is_valid():
            content = form.cleaned_data['content']
            new_post = Post(
                created_by = request.user,
                content=content
            )
            new_post.save()
    return HttpResponseRedirect(reverse("posts"))

@login_required(login_url='/login/')
def follow(request, follow_user):
    
    # Get the current user
    current_user = request.user

    # Get the User object to follow based on the provided username
    follow_user_obj = get_object_or_404(User, username=follow_user)

    # Get or create the UserFollowing object for the current user
    user_following_obj, _ = UserFollowing.objects.get_or_create(user=current_user)

    follow_success = False
    # Check if the current user is not already following the follow_user_obj and it's not the same user
    if follow_user_obj != current_user and not user_following_obj.is_following(follow_user_obj):
        # Add the follow_user_obj to the following ManyToManyField of the current user
        follow_success = True
        
        # user_following_obj.follow(follow_user_obj)
        user_following_obj.follow(follow_user_obj)
        current_user.following.add(follow_user_obj)
        # follow_user_obj.following.add(current_user)
        
        followers = follow_user_obj.followers_set.count()     
        print('Follow success')
    elif user_following_obj.is_following(follow_user_obj):
        follow_success = False
        user_following_obj.unfollow(follow_user_obj)
        current_user.following.remove(follow_user_obj)
        followers = follow_user_obj.followers_set.count()
        print('Unfollow success')


    else:
        print('Cannot follow this user')
        

    return JsonResponse({'following': follow_success, 'followers':followers})


def print_following_users(request):
    current_user = request.user
    
    try:
        user_following_obj = UserFollowing.objects.get(user=current_user)
        following_users = user_following_obj.following.all()
        
        for user in following_users:
            print(user.username)
            
    except UserFollowing.DoesNotExist:
        print("Now current followers")
    return


def user_page(request, user):
    if request.user.is_authenticated:
        current_user = request.user
    user_obj = User.objects.get(username=user)
    
    # get this user's posts
    posts = Post.objects.filter(created_by=user_obj.id).order_by('-created').annotate(like_count=models.Count('likes'))
    
    if request.user.is_authenticated:
        posts = posts.prefetch_related(Prefetch(
            'likes',
            queryset=Like.objects.filter(user=current_user),
            to_attr='user_likes'
        ))
        try:
            liked_post_ids = Like.objects.filter(user=user_obj).values_list('post', flat=True)
            liked_posts = Post.objects.filter(id__in=liked_post_ids).order_by('-created')
        except:
            liked_posts = 'No posts liked'
        print(liked_posts)
    
    # users following
    try:
        following_count = UserFollowing.objects.get(user=user_obj).following_count()
    except UserFollowing.DoesNotExist:
        following_count = 0
        
    # Get the follower count
    try:
        userid = user_id(user)
        user_follower = get_object_or_404(User, pk=userid)
        follower_count = user_follower.followers.all().count()
    except:
        follower_count = 0
        
    # follow status
    if request.user.is_authenticated:
        follow_status = UserFollowing.objects.get(user=current_user).is_following(user_obj)
    else:
        follow_status = False
        
    
    return render(request, 'network/user.html', {'user_obj':user_obj, 'posts':posts, 'liked_posts':liked_posts, 'following_count': following_count, 'follower_count':follower_count, 'follow_status':follow_status})

def posts(request):
    new_post_form = NewPost()
    user = request.user
    all_posts = Post.objects.filter(is_active=True).order_by('-created')

    data = []
    user_post_data = []
    following_data = []

    for post in all_posts:
        post_data = {
            'id': post.id,
            'content': post.content,
            'created': post.created,
            'created_by': post.created_by.username,
            'created_by_id': post.created_by.id,
            'is_liked': user.is_authenticated and Like.objects.filter(post=post, user=user).exists(),
            'likes': post.total_likes(),
            'can_follow': user.is_authenticated and user.id != post.created_by.id
        }
        data.append(post_data)
        if post_data['can_follow']:
            user_post_data.append(post_data)

    # Pagination for all posts
    data_paginator = Paginator(data, 5)
    page = data_paginator.get_page(request.GET.get('page'))

    # Pagination for user-specific posts
    data_user_paginator = Paginator(user_post_data, 5)
    page_user = data_user_paginator.get_page(request.GET.get('page'))

    if user.is_authenticated:
        # Following posts
        following_ids = UserFollowing.objects.filter(user=user).values_list('following__id', flat=True)
        following_posts = Post.objects.filter(is_active=True, created_by__id__in=following_ids).order_by('-created')

        for post in following_posts:
            post_data = {
                'id': post.id,
                'content': post.content,
                'created': post.created,
                'created_by': post.created_by.username,
                'created_by_id': post.created_by.id,
                'is_liked': Like.objects.filter(post=post, user=user).exists(),
                'likes': post.total_likes()
            }
            following_data.append(post_data)

        # Pagination for following posts
        following_posts_paginator = Paginator(following_data, 5)
        page_following = following_posts_paginator.get_page(request.GET.get('page'))

        followers_count = user.followers_set.count()
        following_count = user.following.count()
    else:
        page_following = None
        followers_count = 0
        following_count = 0

    return render(request, 'network/posts.html', {
        'post_data': post_data,
        'posts': all_posts,
        'data': data,
        'new_post_form': new_post_form,
        'following_data': following_data,
        'followers_count': followers_count,
        'following_count': following_count,
        'page_following': page_following,
        'page': page,
        'page_user': page_user
    })
    
# Get posts that the user follows
def following_user_post(request):
    user = request.user
    following_users = followings(user)
    following_data = []
    for user in following_users:
        posts = Post.objects.filter(is_active=True, created_by=user).order_by('-created')
        for post in posts:
            post_data = {
                'id': post.id,
                'content': post.content,
                'created': post.created,
                'created_by': post.created_by.username,
                'created_by_id': post.created_by.id,
                'is_liked': False,
                'following_user': False,
                'likes': post.total_likes()
            }
            following_data.append(post_data)
    
    return JsonResponse({'data': following_data})
    

def stats(request, check_user):
    user = request.user
    # who is this user FOLLOWING
    userid = user_id(check_user)
    check_user_obj = User.objects.get(username=check_user)
    try:
        user_following = UserFollowing.objects.get(user=userid)
        followings = user_following.following.all()
        following_dates = [UserFollowing.objects.get(user=userid, following=followed_user).followed_date for followed_user in followings]
    except:
        followings = []
        following_dates = []
    
    
    # who are the FOLLOWERS of the user
    try:
        user_follower = get_object_or_404(User, pk=userid)
        followers = user_follower.followers.all()
        follower_dates = [UserFollowing.objects.get(user=follower.user, following=userid).followed_date for follower in followers]
    except:
        followers = []
        follower_dates = []
    
    print(followings, followers)
    
    context = {
        'followings': zip(followings, following_dates),
        'followers': zip(followers, follower_dates),
        'check_user': check_user_obj,
        'user': user
    }
    
    return render(request, 'network/stats.html', context)



### Helper funcs
def user_id(username):
    try:
        user_id = User.objects.get(username=username).id
    except:
        print("Username does not exists")
    return user_id

# get all followings
def followings(username):
    try:
        user_following_obj = UserFollowing.objects.get(user=username)
        following_users = user_following_obj.following.all()   
    except UserFollowing.DoesNotExist:
        print("No current followings")
        
    return following_users