-- Create verification requests table for organizer verification workflow
CREATE TABLE IF NOT EXISTS `verificationRequests` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `organizerId` int NOT NULL,
  `businessName` varchar(255) NOT NULL,
  `businessType` enum('business', 'nonprofit', 'community', 'municipality', 'school-library', 'other') NOT NULL,
  `documentUrl` text NOT NULL,
  `additionalInfo` text,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
  `adminNotes` text,
  `submittedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `reviewedAt` timestamp,
  `reviewedBy` int,
  FOREIGN KEY (`organizerId`) REFERENCES `organizers`(`id`) ON DELETE CASCADE
);
