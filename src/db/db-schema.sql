CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  email text,
  phone text,
  logo_url text,
  signature_url text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE,
  customer_id uuid REFERENCES customers(id),
  branch_id uuid REFERENCES branches(id),
  issue_date date,
  due_date date,
  subtotal numeric,
  tax numeric DEFAULT 0,
  total numeric,
  discount numeric DEFAULT 0,
  shipping numeric DEFAULT 0,
  currency text DEFAULT 'KES',
  vat_rate numeric DEFAULT 0,
  vat_inclusive boolean DEFAULT false,
  status text DEFAULT 'draft',
  pdf_path text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text,
  quantity integer,
  rate numeric,
  line_total numeric
);
