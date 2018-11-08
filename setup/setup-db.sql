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
   last_login timestamp with time zone,
   created_at timestamp with time zone not null default now(),
   updated_at timestamp with time zone not null default now()
);
alter table users owner to admin_user;
insert into users (username, password, email) values ('testa', '$2b$09$uEn1cunbavXmHEmf6Pg/8eUj4yS67eyWco7ev.Dqv2KjiwAlGU3M.', 'testa@gmail.com');
insert into users (username, password, email) values ('testb', '$2b$09$uEn1cunbavXmHEmf6Pg/8eUj4yS67eyWco7ev.Dqv2KjiwAlGU3M.', 'testb@gmail.com');
