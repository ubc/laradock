FROM php:7.3-apache

# we need composer to pull libraries
COPY --from=composer:1.9 /usr/bin/composer /usr/bin/composer
# git - required by composer
RUN apt-get update && \
	apt-get -y install git

# original Dockerfile wasn't using standard /var/www/html, so this non-standard
# directory setup requires a custom web root config
COPY ./vhost.conf /etc/apache2/sites-available/000-default.conf

COPY src/ /srv/app
WORKDIR /srv/app
RUN composer install --prefer-dist --no-interaction
