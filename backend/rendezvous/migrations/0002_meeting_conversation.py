# Generated by Django 3.1.12 on 2021-07-10 09:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rendezvous', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='meeting',
            name='conversation',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='meeting', to='rendezvous.conversation'),
        ),
    ]
