FROM php:8.2-apache

# Extensions PHP
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y zlib1g-dev libwebp-dev libpng-dev && docker-php-ext-install gd
RUN apt-get install -y libzip-dev && docker-php-ext-install zip
RUN docker-php-ext-install pdo pdo_mysql

# Activer mod_rewrite pour le routage .htaccess
RUN a2enmod rewrite

# Autoriser AllowOverride pour que .htaccess fonctionne
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

EXPOSE 80
