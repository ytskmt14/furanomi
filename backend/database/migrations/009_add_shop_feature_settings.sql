-- Add shop_feature_settings table for managing shop-specific feature toggles
-- EAV (Entity-Attribute-Value) pattern for extensibility
CREATE TABLE IF NOT EXISTS shop_feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  feature_name VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_shop_feature_settings_shop_id ON shop_feature_settings(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_feature_settings_feature_name ON shop_feature_settings(feature_name);
CREATE INDEX IF NOT EXISTS idx_shop_feature_settings_shop_feature ON shop_feature_settings(shop_id, feature_name);

-- Trigger for updating updated_at
CREATE TRIGGER update_shop_feature_settings_updated_at
BEFORE UPDATE ON shop_feature_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


