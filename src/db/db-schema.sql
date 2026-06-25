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

ALTER TABLE invoices ALTER COLUMN issue_date SET DEFAULT CURRENT_DATE;

ALTER TABLE invoices
ADD CONSTRAINT invoice_status_check
CHECK (
    status IN (
        'draft',
        'sent',
        'paid',
        'partially_paid',
        'cancelled'
    )
);

CREATE OR REPLACE FUNCTION set_due_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date IS NULL THEN
        NEW.due_date := NEW.issue_date + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_due_date_trigger ON invoices;

CREATE TRIGGER set_due_date_trigger
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_due_date();

CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text,
  quantity integer,
  rate numeric,
  line_total numeric
);

CREATE OR REPLACE FUNCTION search_invoices(
    p_search text DEFAULT NULL,
    p_customer_id uuid DEFAULT NULL,
    p_status text DEFAULT NULL,
    p_date_from date DEFAULT NULL,
    p_date_to date DEFAULT NULL,
    p_min_total numeric DEFAULT NULL,
    p_max_total numeric DEFAULT NULL,
    p_vat_inclusive boolean DEFAULT NULL,
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    invoice_number text,
    customer_id uuid,
    issue_date date,
    due_date date,
    subtotal numeric,
    tax numeric,
    total numeric,
    status text,
    pdf_path text,
    created_at timestamp,
    branch_id uuid,
    discount numeric,
    shipping numeric,
    currency text,
    vat_rate numeric,
    vat_inclusive boolean,
    customer jsonb,
    items jsonb,
    total_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.invoice_number,
        i.customer_id,
        i.issue_date,
        i.due_date,
        i.subtotal,
        i.tax,
        i.total,
        i.status,
        i.pdf_path,
        i.created_at,
        i.branch_id,
        i.discount,
        i.shipping,
        i.currency,
        i.vat_rate,
        i.vat_inclusive,
        jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'email', c.email,
            'phone', c.phone,
            'address', c.address,
            'created_at', c.created_at
        ) AS customer,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', ii.id,
                    'invoice_id', ii.invoice_id,
                    'description', ii.description,
                    'quantity', ii.quantity,
                    'rate', ii.rate,
                    'line_total', ii.line_total
                )
            ) FROM invoice_items ii WHERE ii.invoice_id = i.id),
            '[]'::jsonb
        ) AS items,
        COUNT(*) OVER() AS total_count
    FROM invoices i
    LEFT JOIN customers c ON c.id = i.customer_id
    WHERE
        (p_search IS NULL
            OR i.invoice_number ILIKE '%' || p_search || '%'
            OR c.name ILIKE '%' || p_search || '%'
            OR i.status ILIKE '%' || p_search || '%'
            OR EXISTS (
                SELECT 1
                FROM invoice_items ii
                WHERE ii.invoice_id = i.id
                  AND ii.description ILIKE '%' || p_search || '%'
            )
        )
        AND (p_customer_id IS NULL OR i.customer_id = p_customer_id)
        AND (p_status IS NULL OR i.status = p_status)
        AND (p_date_from IS NULL OR i.issue_date >= p_date_from)
        AND (p_date_to IS NULL OR i.issue_date <= p_date_to)
        AND (p_min_total IS NULL OR i.total >= p_min_total)
        AND (p_max_total IS NULL OR i.total <= p_max_total)
        AND (p_vat_inclusive IS NULL OR i.vat_inclusive = p_vat_inclusive)
    ORDER BY i.issue_date DESC
    LIMIT p_page_size
    OFFSET ((p_page - 1) * p_page_size);
END;
$$ LANGUAGE plpgsql;

ALTER TABLE invoices
ADD COLUMN amount_paid numeric DEFAULT 0;
