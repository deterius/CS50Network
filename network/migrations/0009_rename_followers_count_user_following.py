# Generated by Django 4.2 on 2023-06-30 12:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_user_followers_count'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='followers_count',
            new_name='following',
        ),
    ]