-- Add missing indexes on foreign key columns

-- ClientNote.authorId - used in joins when fetching notes with author info
CREATE INDEX IF NOT EXISTS "ClientNote_authorId_idx" ON "ClientNote"("authorId");

-- Organization.accountManagerId - used when filtering orgs by account manager
CREATE INDEX IF NOT EXISTS "Organization_accountManagerId_idx" ON "Organization"("accountManagerId");
