CREATE TABLE `apports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prescripteurId` int NOT NULL,
	`clientNom` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`clientPhone` varchar(32),
	`dossierId` int,
	`statut` enum('en_attente','contacte','en_cours','converti','perdu') NOT NULL DEFAULT 'en_attente',
	`commission` decimal(10,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dossierId` int NOT NULL,
	`uploaderId` int NOT NULL,
	`nom` varchar(255) NOT NULL,
	`type` enum('piece_identite','contrat','devis','justificatif_domicile','rib','bulletin_salaire','autre') NOT NULL DEFAULT 'autre',
	`s3Key` varchar(512) NOT NULL,
	`s3Url` text NOT NULL,
	`mimeType` varchar(128),
	`taille` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dossiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`mandataireId` int,
	`prescripteurId` int,
	`titre` varchar(255) NOT NULL,
	`description` text,
	`type` enum('assurance_vie','assurance_habitation','assurance_auto','assurance_sante','prevoyance','retraite','autre') NOT NULL DEFAULT 'autre',
	`statut` enum('prospect','en_cours','devis_envoye','en_attente_documents','contrat_signe','actif','resilie','archive') NOT NULL DEFAULT 'prospect',
	`montantPrime` decimal(10,2),
	`dateEffet` timestamp,
	`dateEcheance` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dossiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('client','prospect','prescripteur','mandataire') NOT NULL,
	`token` varchar(128) NOT NULL,
	`createdByAdminId` int NOT NULL,
	`utilisee` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`dossierId` int,
	`contenu` text NOT NULL,
	`lu` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`titre` varchar(255) NOT NULL,
	`contenu` text NOT NULL,
	`type` enum('nouveau_message','nouveau_document','statut_dossier','nouvelle_demande','invitation','autre') NOT NULL DEFAULT 'autre',
	`lu` boolean NOT NULL DEFAULT false,
	`lienId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','client','prospect','prescripteur','mandataire') NOT NULL DEFAULT 'prospect';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `createdByAdminId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;