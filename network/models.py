from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone

# For the admin panel
from django.contrib import admin

class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='followers_set')
    pass

class Post(models.Model):
    id = models.BigAutoField(primary_key=True)
    content = models.TextField()
    created = models.DateTimeField(auto_now_add=True, editable=False)
    updated = models.DateTimeField(auto_now=True, editable=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, related_name="post_createdy_by", on_delete=models.CASCADE)
    
    def total_likes(self):
        return self.likes.count()
    

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'created', 'updated', 'is_active', 'created_by')
    
class Like(models.Model):
    post = models.ForeignKey(Post, related_name="likes", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="Liked_by", on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now=True)
    is_liked = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('post', 'user')
        
class UserFollowing(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    following = models.ManyToManyField(User, related_name='followers')
    followed_date = models.DateTimeField(auto_now_add=True, editable=False)
    
    def follow(self, user):
        print('follow method activated')
        if user != self.user:
            self.following.add(user)
    
    def unfollow(self, user):
        print('UNfollow method activated')
        self.following.remove(user)
        
    def is_following(self, user):
        return self.following.filter(pk=user.pk).exists()
    
    def following_count(self):
        return self.following.count()
    
    
admin.site.register(Post, PostAdmin)
