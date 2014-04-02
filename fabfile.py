from fabric.api import *  # noqa
from fabvenv import virtualenv


def staging():
    env.hosts = ['ecobasa@server.sinnwerkstatt.com']
    env.path = '/srv/ecobasa.sinnwerkstatt.com/ecobasa/'
    env.virtualenv_path = '/srv/ecobasa.sinnwerkstatt.com/ecobasaenv/'
    env.push_branch = 'tour'
    env.push_remote = 'origin'


def production():
    pass


def update():
    with cd(env.path):
        run("git pull %(push_remote)s %(push_branch)s" % env)
        with virtualenv(env.virtualenv_path):
            run("pip install -r requirements.txt")
            run("./manage.py collectstatic --noinput")


def migrate():
    with virtualenv(env.virtualenv_path):
        run("%(path)s/manage.py syncdb" % env)
        run("%(path)s/manage.py migrate" % env)


def deploy():
    update()
    migrate()
    run("supervisorctl reload ecobasa")