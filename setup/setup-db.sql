drop database if exists node_express_rest_api;
drop user if exists admin_user;
create user admin_user;
alter user admin_user with encrypted password 'password';
create database node_express_rest_api;
grant all privileges on database node_express_rest_api to admin_user;
\c node_express_rest_api;
drop table if exists users;
create table users(
   id serial primary key not null,
   username varchar(255) NOT NULL,
   password varchar(255) NOT NULL,
   email varchar(255),
   created timestamp with time zone not null default now()
);
alter table users owner to admin_user;
insert into users (username, password, email) values ('testa', 'password', 'testa@gmail.com');
insert into users (username, password, email) values ('testb', 'password', 'testb@gmail.com');
insert into users (username, password, email) values ('testc', 'password', 'testc@gmail.com');
insert into users (username, password, email) values ('testd', 'password', 'testd@gmail.com');
insert into users (username, password, email) values ('teste', 'password', 'teste@gmail.com');