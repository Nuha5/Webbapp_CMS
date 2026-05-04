-- Script to remove AnnouncementBanners content type from EPiServer database
-- This removes the orphaned content type that was deleted from code but still exists in the database

-- First, find the content type ID
SELECT ContentTypeID, Name, DisplayName 
FROM tblContentType 
WHERE Name = 'AnnouncementBanners' OR DisplayName LIKE '%AnnouncementBanners%';

-- Delete the content type (this also cascades to remove property definitions, etc.)
-- NOTE: Make sure no instances of this block exist in content before deleting
DELETE FROM tblContentType 
WHERE Name = 'AnnouncementBanners' OR DisplayName LIKE '%AnnouncementBanners%';

-- Verify deletion
SELECT ContentTypeID, Name, DisplayName 
FROM tblContentType 
WHERE Name = 'AnnouncementBanners' OR DisplayName LIKE '%AnnouncementBanners%';
