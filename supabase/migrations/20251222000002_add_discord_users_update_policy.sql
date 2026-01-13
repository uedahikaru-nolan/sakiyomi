-- discord_usersテーブルに管理者用の更新ポリシーを追加
-- 作成日: 2025-12-22
-- 説明: 管理者のみdiscord_usersテーブルのis_adminフラグを更新可能にする

CREATE POLICY "Admins can update discord users"
ON discord_users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);
