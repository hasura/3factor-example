BEGIN;

CREATE TABLE public.orders (
  order_id text PRIMARY KEY,
  user_id text NOT NULL,
  restaurant_id integer NOT NULL,
  address text NOT NULL,
  placed boolean DEFAULT false NOT NULL,
  approved boolean DEFAULT false NOT NULL,
  driver_assigned boolean DEFAULT false NOT NULL,
  food_picked boolean DEFAULT false NOT NULL,
  delivered boolean DEFAULT false NOT NULL,
  order_valid boolean DEFAULT false,
  payment_valid boolean,
  created timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.menu_items (
  name text NOT NULL
);

CREATE TABLE public.items (
  id serial NOT NULL,
  order_id text NOT NULL,
  item text NOT NULL
);

ALTER TABLE ONLY public.items
  ADD CONSTRAINT items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);

CREATE TABLE public.assignment (
  order_id text NOT NULL,
  driver_id integer NOT NULL
);

ALTER TABLE ONLY public.assignment
  ADD CONSTRAINT assignment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);

CREATE TABLE public.payments (
  id serial NOT NULL,
  order_id text NOT NULL,
  type text NOT NULL,
  amount integer NOT NULL
);

ALTER TABLE ONLY public.payments
  ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);

CREATE VIEW public.number_order_approved AS
  SELECT count(*) AS count
    FROM public.orders
   WHERE (orders.approved = true);

CREATE VIEW public.number_order_driver_assigned AS
  SELECT count(*) AS count
    FROM public.orders
   WHERE (orders.driver_assigned = true);

CREATE VIEW public.number_order_payment_valid AS
  SELECT count(*) AS count
    FROM public.orders
   WHERE (orders.payment_valid = true);

CREATE VIEW public.number_order_validated AS
  SELECT count(*) AS count
    FROM public.orders
   WHERE (orders.order_valid = true);

CREATE VIEW public.number_orders AS
  SELECT count(*) AS count
    FROM public.orders;

COMMIT;
