from django import forms
from .models import Post

class NewPost(forms.ModelForm):
    content = forms.CharField(widget=forms.Textarea(attrs={
        'class': 'new-post-text-field',  # CSS class name
    }))
    class Meta:
        model = Post
        fields = ['content']
        