/**
 * MockDataverseClient: In-memory Dataverse client for demo mode.
 * Stores data in localStorage and simulates API behavior.
 */
import type {
  LeadEntity,
  LeadCreateDto,
  LeadUpdateDto,
  TaskEntity,
  TaskCreateDto,
  ActivityEntity,
  OpportunityEntity,
  OpportunityCreateDto,
  OpportunityUpdateDto,
  ODataCollectionResponse,
} from '@/types/dataverse'
import { DEFAULT_PAGE_SIZE, OPPORTUNITY_PHASES, OPPORTUNITY_STATUS } from '@/lib/config/constants'

const STORAGE_KEY = 'mock-dataverse-leads'
const STORAGE_KEY_TASKS = 'mock-dataverse-tasks'
const STORAGE_KEY_OPPORTUNITIES = 'mock-dataverse-opportunities'
const STORAGE_VERSION_KEY = 'mock-dataverse-version'
const CURRENT_DATA_VERSION = '2'

// Invalidate old demo data when version changes
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
  if (storedVersion !== CURRENT_DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY_TASKS)
    localStorage.removeItem(STORAGE_KEY_OPPORTUNITIES)
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_DATA_VERSION)
  }
}

// ── Helper to create dates relative to now ──
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString()

// ── Demo Users (must match mock-auth DEMO_USERS) ──
const OWNER_SARAH = 'demo-user-001'
const OWNER_MICHAEL = 'demo-user-002'
const OWNER_ANNA = 'demo-user-003'

// Demo leads for initial data - 15 per user = 45 total
const INITIAL_LEADS: LeadEntity[] = [
  // ── Sarah Schmidt's Leads (demo-user-001) ──
  { leadid: 'lead-s-01', fullname: 'Anna Mueller', firstname: 'Anna', lastname: 'Mueller', companyname: 'TechVentures GmbH', emailaddress1: 'anna@techventures.de', mobilephone: '+49 151 1234567', jobtitle: 'CTO', leadsourcecode: 8, statuscode: 2, statecode: 0, subject: 'ERP Migration Interest', description: 'Interesse an einer vollstaendigen ERP-Migration auf Dynamics 365.', revenue: 85000, createdon: daysAgo(30), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-02', fullname: 'Thomas Weber', firstname: 'Thomas', lastname: 'Weber', companyname: 'DataFlow AG', emailaddress1: 'thomas@dataflow.com', mobilephone: '+49 170 9876543', jobtitle: 'Head of IT', leadsourcecode: 7, statuscode: 1, statecode: 0, subject: 'Cloud Migration', description: 'Azure Cloud Migration Anfrage.', revenue: 120000, createdon: daysAgo(25), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-03', fullname: 'Sarah Koch', firstname: 'Sarah', lastname: 'Koch', companyname: 'CloudFirst Inc', emailaddress1: 'sarah@cloudfirst.com', mobilephone: '+49 160 5554321', jobtitle: 'VP Engineering', leadsourcecode: 3, statuscode: 3, statecode: 0, subject: 'Dynamics 365 Implementation', description: 'D365 Einfuehrung fuer 200 Nutzer.', revenue: 200000, createdon: daysAgo(45), modifiedon: daysAgo(3), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-04', fullname: 'Klaus Richter', firstname: 'Klaus', lastname: 'Richter', companyname: 'Richter & Soehne KG', emailaddress1: 'k.richter@richter-soehne.de', mobilephone: '+49 171 3334455', jobtitle: 'Geschaeftsfuehrer', leadsourcecode: 9, statuscode: 2, statecode: 0, subject: 'CRM Einfuehrung', description: 'Sucht ein modernes CRM fuer 50 Mitarbeiter.', revenue: 60000, createdon: daysAgo(20), modifiedon: daysAgo(5), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-05', fullname: 'Lisa Braun', firstname: 'Lisa', lastname: 'Braun', companyname: 'DigitalWave GmbH', emailaddress1: 'l.braun@digitalwave.de', mobilephone: '+49 152 6667788', jobtitle: 'IT-Leiterin', leadsourcecode: 1, statuscode: 1, statecode: 0, subject: 'Business Intelligence Loesung', description: 'Moechte Power BI in bestehende Infrastruktur integrieren.', revenue: 35000, createdon: daysAgo(15), modifiedon: daysAgo(7), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-06', fullname: 'Peter Schwarz', firstname: 'Peter', lastname: 'Schwarz', companyname: 'AutoTech Systems', emailaddress1: 'p.schwarz@autotech.de', mobilephone: '+49 173 1112233', jobtitle: 'Betriebsleiter', leadsourcecode: 4, statuscode: 2, statecode: 0, subject: 'IoT Integration', description: 'IoT-Sensorik an D365 anbinden.', revenue: 95000, createdon: daysAgo(12), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-07', fullname: 'Martina Hoffmann', firstname: 'Martina', lastname: 'Hoffmann', companyname: 'GreenEnergy AG', emailaddress1: 'm.hoffmann@greenenergy.de', mobilephone: '+49 155 4443322', jobtitle: 'CFO', leadsourcecode: 6, statuscode: 4, statecode: 0, subject: 'Finance Module', description: 'D365 Finance & Operations Modul.', revenue: 150000, createdon: daysAgo(40), modifiedon: daysAgo(10), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-08', fullname: 'Jens Fischer', firstname: 'Jens', lastname: 'Fischer', companyname: 'Fischer Logistik', emailaddress1: 'j.fischer@fischer-log.de', mobilephone: '+49 176 8889900', jobtitle: 'Supply Chain Manager', leadsourcecode: 2, statuscode: 1, statecode: 0, subject: 'Supply Chain Optimization', description: 'Lagerbestand und Logistik digitalisieren.', revenue: 70000, createdon: daysAgo(8), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-09', fullname: 'Claudia Lang', firstname: 'Claudia', lastname: 'Lang', companyname: 'MediTech Solutions', emailaddress1: 'c.lang@meditech.de', mobilephone: '+49 157 2223344', jobtitle: 'Direktorin IT', leadsourcecode: 5, statuscode: 2, statecode: 0, subject: 'Healthcare CRM', description: 'CRM speziell fuer den Gesundheitssektor.', revenue: 110000, createdon: daysAgo(18), modifiedon: daysAgo(4), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-10', fullname: 'Robert Baumann', firstname: 'Robert', lastname: 'Baumann', companyname: 'Baumann Consulting', emailaddress1: 'r.baumann@baumann-consulting.de', mobilephone: '+49 178 5556677', jobtitle: 'Partner', leadsourcecode: 3, statuscode: 3, statecode: 0, subject: 'Consulting Plattform', description: 'Projektmanagement-Tool auf D365 Basis.', revenue: 45000, createdon: daysAgo(50), modifiedon: daysAgo(15), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-11', fullname: 'Eva Schreiber', firstname: 'Eva', lastname: 'Schreiber', companyname: 'SchreiberMedia', emailaddress1: 'e.schreiber@schreibermedia.de', mobilephone: '+49 163 7778899', jobtitle: 'Marketing Direktorin', leadsourcecode: 8, statuscode: 1, statecode: 0, subject: 'Marketing Automation', description: 'Automatisierte Marketingkampagnen.', revenue: 30000, createdon: daysAgo(5), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-12', fullname: 'Markus Wolf', firstname: 'Markus', lastname: 'Wolf', companyname: 'WolfBau AG', emailaddress1: 'm.wolf@wolfbau.de', mobilephone: '+49 174 3332211', jobtitle: 'Prokurist', leadsourcecode: 10, statuscode: 2, statecode: 0, subject: 'Projekt-Controlling', description: 'D365 Project Operations fuer Bauprojekte.', revenue: 180000, createdon: daysAgo(22), modifiedon: daysAgo(3), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-13', fullname: 'Nadine Stein', firstname: 'Nadine', lastname: 'Stein', companyname: 'Stein Pharma', emailaddress1: 'n.stein@steinpharma.de', mobilephone: '+49 159 1110022', jobtitle: 'Head of Digital', leadsourcecode: 4, statuscode: 1, statecode: 0, subject: 'Pharma Compliance', description: 'Compliance-Tracking und Validierung.', revenue: 90000, createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-14', fullname: 'Frank Berger', firstname: 'Frank', lastname: 'Berger', companyname: 'BergerTech', emailaddress1: 'f.berger@bergertech.de', mobilephone: '+49 162 4445566', jobtitle: 'CEO', leadsourcecode: 9, statuscode: 4, statecode: 0, subject: 'ERP Abloesung', description: 'Altes SAP durch D365 ersetzen.', revenue: 250000, createdon: daysAgo(60), modifiedon: daysAgo(20), _ownerid_value: OWNER_SARAH },
  { leadid: 'lead-s-15', fullname: 'Heike Neumann', firstname: 'Heike', lastname: 'Neumann', companyname: 'Neumann & Partner', emailaddress1: 'h.neumann@neumann-partner.de', mobilephone: '+49 177 9998877', jobtitle: 'Partnerin', leadsourcecode: 2, statuscode: 2, statecode: 0, subject: 'Kanzlei-Software', description: 'D365 als Plattform fuer Rechtsanwaltskanzlei.', revenue: 55000, createdon: daysAgo(10), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },

  // ── Michael Weber's Leads (demo-user-002) ──
  { leadid: 'lead-m-01', fullname: 'Carsten Vogel', firstname: 'Carsten', lastname: 'Vogel', companyname: 'Vogel Maschinenbau', emailaddress1: 'c.vogel@vogel-mb.de', mobilephone: '+49 151 2345678', jobtitle: 'Technischer Leiter', leadsourcecode: 7, statuscode: 2, statecode: 0, subject: 'Produktionsplanung', description: 'MES-Integration mit D365 SCM.', revenue: 140000, createdon: daysAgo(28), modifiedon: daysAgo(2), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-02', fullname: 'Anja Krause', firstname: 'Anja', lastname: 'Krause', companyname: 'StyleHouse GmbH', emailaddress1: 'a.krause@stylehouse.de', mobilephone: '+49 170 3456789', jobtitle: 'Geschaeftsfuehrerin', leadsourcecode: 8, statuscode: 1, statecode: 0, subject: 'E-Commerce Integration', description: 'Shopify-D365 Anbindung.', revenue: 50000, createdon: daysAgo(14), modifiedon: daysAgo(3), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-03', fullname: 'Dirk Hansen', firstname: 'Dirk', lastname: 'Hansen', companyname: 'Hansen Shipping', emailaddress1: 'd.hansen@hansen-shipping.de', mobilephone: '+49 160 4567890', jobtitle: 'COO', leadsourcecode: 4, statuscode: 3, statecode: 0, subject: 'Logistik-Digitalisierung', description: 'Flottenmanagement und Routenoptimierung.', revenue: 175000, createdon: daysAgo(35), modifiedon: daysAgo(5), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-04', fullname: 'Birgit Meier', firstname: 'Birgit', lastname: 'Meier', companyname: 'Meier Textil', emailaddress1: 'b.meier@meier-textil.de', mobilephone: '+49 171 5678901', jobtitle: 'Leiterin Einkauf', leadsourcecode: 6, statuscode: 2, statecode: 0, subject: 'Lieferantenmanagement', description: 'Vendor-Management Modul.', revenue: 65000, createdon: daysAgo(19), modifiedon: daysAgo(4), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-05', fullname: 'Stefan Koenig', firstname: 'Stefan', lastname: 'Koenig', companyname: 'KoenigSoft', emailaddress1: 's.koenig@koenigsoft.de', mobilephone: '+49 152 6789012', jobtitle: 'CTO', leadsourcecode: 1, statuscode: 1, statecode: 0, subject: 'Custom App Development', description: 'Power Apps fuer interne Prozesse.', revenue: 40000, createdon: daysAgo(7), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-06', fullname: 'Monika Schulz', firstname: 'Monika', lastname: 'Schulz', companyname: 'Schulz Immobilien', emailaddress1: 'm.schulz@schulz-immo.de', mobilephone: '+49 173 7890123', jobtitle: 'Inhaberin', leadsourcecode: 9, statuscode: 2, statecode: 0, subject: 'Immobilien CRM', description: 'Objektverwaltung und Kundenbetreuung.', revenue: 75000, createdon: daysAgo(16), modifiedon: daysAgo(3), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-07', fullname: 'Uwe Becker', firstname: 'Uwe', lastname: 'Becker', companyname: 'Becker Elektro', emailaddress1: 'u.becker@becker-elektro.de', mobilephone: '+49 155 8901234', jobtitle: 'Betriebsleiter', leadsourcecode: 5, statuscode: 4, statecode: 0, subject: 'Auftragsmanagement', description: 'Field-Service Modul fuer Techniker.', revenue: 55000, createdon: daysAgo(42), modifiedon: daysAgo(12), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-08', fullname: 'Petra Hartmann', firstname: 'Petra', lastname: 'Hartmann', companyname: 'Hartmann Food', emailaddress1: 'p.hartmann@hartmann-food.de', mobilephone: '+49 176 9012345', jobtitle: 'Quality Manager', leadsourcecode: 3, statuscode: 1, statecode: 0, subject: 'Qualitaetssicherung', description: 'Rueckverfolgbarkeit in der Lebensmittelkette.', revenue: 95000, createdon: daysAgo(6), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-09', fullname: 'Lars Friedrich', firstname: 'Lars', lastname: 'Friedrich', companyname: 'Friedrich Automotive', emailaddress1: 'l.friedrich@friedrich-auto.de', mobilephone: '+49 157 0123456', jobtitle: 'Werkleiter', leadsourcecode: 2, statuscode: 2, statecode: 0, subject: 'Wartungsplanung', description: 'Predictive Maintenance Loesung.', revenue: 130000, createdon: daysAgo(21), modifiedon: daysAgo(6), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-10', fullname: 'Karin Zimmermann', firstname: 'Karin', lastname: 'Zimmermann', companyname: 'ZimmerDesign', emailaddress1: 'k.zimmermann@zimmerdesign.de', mobilephone: '+49 178 1234509', jobtitle: 'Creative Director', leadsourcecode: 10, statuscode: 3, statecode: 0, subject: 'Projekt-Tool', description: 'Kreativprojekte zentral verwalten.', revenue: 28000, createdon: daysAgo(38), modifiedon: daysAgo(8), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-11', fullname: 'Ralf Jansen', firstname: 'Ralf', lastname: 'Jansen', companyname: 'Jansen Stahl', emailaddress1: 'r.jansen@jansen-stahl.de', mobilephone: '+49 163 2345610', jobtitle: 'Einkaufsleiter', leadsourcecode: 4, statuscode: 1, statecode: 0, subject: 'Materialbeschaffung', description: 'Digitalisierung des Einkaufsprozesses.', revenue: 85000, createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-12', fullname: 'Sandra Lenz', firstname: 'Sandra', lastname: 'Lenz', companyname: 'LenzMedia Group', emailaddress1: 's.lenz@lenzmedia.de', mobilephone: '+49 174 3456711', jobtitle: 'Managing Director', leadsourcecode: 8, statuscode: 2, statecode: 0, subject: 'Medien-Workflow', description: 'Content-Management und Freigabeprozesse.', revenue: 48000, createdon: daysAgo(13), modifiedon: daysAgo(2), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-13', fullname: 'Tobias Engel', firstname: 'Tobias', lastname: 'Engel', companyname: 'EngelTech', emailaddress1: 't.engel@engeltech.de', mobilephone: '+49 159 4567812', jobtitle: 'Head of Sales', leadsourcecode: 7, statuscode: 1, statecode: 0, subject: 'Sales Automation', description: 'Vertriebsprozesse automatisieren.', revenue: 62000, createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-14', fullname: 'Gabriele Horn', firstname: 'Gabriele', lastname: 'Horn', companyname: 'Horn Versicherungen', emailaddress1: 'g.horn@horn-versicherung.de', mobilephone: '+49 162 5678913', jobtitle: 'Agenturleiterin', leadsourcecode: 1, statuscode: 4, statecode: 0, subject: 'Versicherungs-CRM', description: 'Kundenverwaltung fuer Versicherungsagentur.', revenue: 38000, createdon: daysAgo(55), modifiedon: daysAgo(18), _ownerid_value: OWNER_MICHAEL },
  { leadid: 'lead-m-15', fullname: 'Oliver Brandt', firstname: 'Oliver', lastname: 'Brandt', companyname: 'Brandt Chemie', emailaddress1: 'o.brandt@brandt-chemie.de', mobilephone: '+49 177 6789014', jobtitle: 'Laborleiter', leadsourcecode: 6, statuscode: 2, statecode: 0, subject: 'Labor-Informationssystem', description: 'LIMS Integration mit D365.', revenue: 105000, createdon: daysAgo(9), modifiedon: daysAgo(2), _ownerid_value: OWNER_MICHAEL },

  // ── Anna Mueller's Leads (demo-user-003) ──
  { leadid: 'lead-a-01', fullname: 'Christian Roth', firstname: 'Christian', lastname: 'Roth', companyname: 'Roth Energie', emailaddress1: 'c.roth@roth-energie.de', mobilephone: '+49 151 3456780', jobtitle: 'Energiemanager', leadsourcecode: 5, statuscode: 2, statecode: 0, subject: 'Energiemanagement', description: 'ISO 50001 konformes Energiemonitoring.', revenue: 72000, createdon: daysAgo(26), modifiedon: daysAgo(3), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-02', fullname: 'Julia Werner', firstname: 'Julia', lastname: 'Werner', companyname: 'Werner IT Services', emailaddress1: 'j.werner@werner-it.de', mobilephone: '+49 170 4567891', jobtitle: 'Geschaeftsfuehrerin', leadsourcecode: 9, statuscode: 1, statecode: 0, subject: 'IT Service Management', description: 'ITSM-Loesung auf D365 Basis.', revenue: 58000, createdon: daysAgo(11), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-03', fullname: 'Matthias Schuster', firstname: 'Matthias', lastname: 'Schuster', companyname: 'Schuster Bau', emailaddress1: 'm.schuster@schuster-bau.de', mobilephone: '+49 160 5678902', jobtitle: 'Bauleiter', leadsourcecode: 3, statuscode: 3, statecode: 0, subject: 'Baustellenmanagement', description: 'Digitale Baustellen-Dokumentation.', revenue: 88000, createdon: daysAgo(33), modifiedon: daysAgo(7), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-04', fullname: 'Susanne Kramer', firstname: 'Susanne', lastname: 'Kramer', companyname: 'Kramer Hotels', emailaddress1: 's.kramer@kramer-hotels.de', mobilephone: '+49 171 6789013', jobtitle: 'Revenue Manager', leadsourcecode: 8, statuscode: 2, statecode: 0, subject: 'Hotel-Management', description: 'PMS-Integration mit D365.', revenue: 115000, createdon: daysAgo(17), modifiedon: daysAgo(4), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-05', fullname: 'Andreas Beck', firstname: 'Andreas', lastname: 'Beck', companyname: 'Beck Automotive', emailaddress1: 'a.beck@beck-auto.de', mobilephone: '+49 152 7890124', jobtitle: 'Vertriebsleiter', leadsourcecode: 7, statuscode: 1, statecode: 0, subject: 'Haendler-Portal', description: 'Partnerportal fuer Autohaendler.', revenue: 95000, createdon: daysAgo(6), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-06', fullname: 'Kathrin Lorenz', firstname: 'Kathrin', lastname: 'Lorenz', companyname: 'Lorenz Finanz', emailaddress1: 'k.lorenz@lorenz-finanz.de', mobilephone: '+49 173 8901235', jobtitle: 'Compliance Officer', leadsourcecode: 1, statuscode: 2, statecode: 0, subject: 'Regulatory Reporting', description: 'Automatisiertes Meldewesen.', revenue: 160000, createdon: daysAgo(23), modifiedon: daysAgo(5), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-07', fullname: 'Holger Maier', firstname: 'Holger', lastname: 'Maier', companyname: 'Maier Werkzeuge', emailaddress1: 'h.maier@maier-werkzeuge.de', mobilephone: '+49 155 9012346', jobtitle: 'Vertriebsinnendienst', leadsourcecode: 2, statuscode: 4, statecode: 0, subject: 'Angebotskonfigurator', description: 'CPQ-Loesung fuer Werkzeugvertrieb.', revenue: 42000, createdon: daysAgo(48), modifiedon: daysAgo(14), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-08', fullname: 'Simone Franke', firstname: 'Simone', lastname: 'Franke', companyname: 'Franke Biotech', emailaddress1: 's.franke@franke-biotech.de', mobilephone: '+49 176 0123457', jobtitle: 'Forschungsleiterin', leadsourcecode: 6, statuscode: 1, statecode: 0, subject: 'Forschungsdatenbank', description: 'Zentrale Verwaltung klinischer Studien.', revenue: 135000, createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-09', fullname: 'Volker Seidel', firstname: 'Volker', lastname: 'Seidel', companyname: 'Seidel Transport', emailaddress1: 'v.seidel@seidel-transport.de', mobilephone: '+49 157 1234568', jobtitle: 'Disponent', leadsourcecode: 4, statuscode: 2, statecode: 0, subject: 'Tourenplanung', description: 'Optimierte Routenplanung und Disposition.', revenue: 68000, createdon: daysAgo(15), modifiedon: daysAgo(3), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-10', fullname: 'Tanja Huber', firstname: 'Tanja', lastname: 'Huber', companyname: 'Huber Gastro', emailaddress1: 't.huber@huber-gastro.de', mobilephone: '+49 178 2345679', jobtitle: 'Betriebsleiterin', leadsourcecode: 10, statuscode: 3, statecode: 0, subject: 'Gastro ERP', description: 'Warenwirtschaft fuer Gastronomiebetrieb.', revenue: 32000, createdon: daysAgo(36), modifiedon: daysAgo(9), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-11', fullname: 'Norbert Paul', firstname: 'Norbert', lastname: 'Paul', companyname: 'Paul Druck', emailaddress1: 'n.paul@paul-druck.de', mobilephone: '+49 163 3456780', jobtitle: 'Produktionsleiter', leadsourcecode: 3, statuscode: 1, statecode: 0, subject: 'Druckauftrags-Management', description: 'Auftragsverwaltung fuer Druckerei.', revenue: 47000, createdon: daysAgo(8), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-12', fullname: 'Ingrid Scholz', firstname: 'Ingrid', lastname: 'Scholz', companyname: 'Scholz Medizintechnik', emailaddress1: 'i.scholz@scholz-med.de', mobilephone: '+49 174 4567891', jobtitle: 'Vertriebsleiterin', leadsourcecode: 4, statuscode: 2, statecode: 0, subject: 'Medizingeraete-Tracking', description: 'Asset-Tracking fuer medizinische Geraete.', revenue: 78000, createdon: daysAgo(19), modifiedon: daysAgo(4), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-13', fullname: 'Georg Wendt', firstname: 'Georg', lastname: 'Wendt', companyname: 'Wendt Solar', emailaddress1: 'g.wendt@wendt-solar.de', mobilephone: '+49 159 5678902', jobtitle: 'Projektleiter', leadsourcecode: 5, statuscode: 1, statecode: 0, subject: 'Solar Projektmanagement', description: 'Planung und Monitoring von PV-Anlagen.', revenue: 92000, createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-14', fullname: 'Barbara Klein', firstname: 'Barbara', lastname: 'Klein', companyname: 'KleinMode', emailaddress1: 'b.klein@kleinmode.de', mobilephone: '+49 162 6789013', jobtitle: 'Einkaufsleiterin', leadsourcecode: 8, statuscode: 4, statecode: 0, subject: 'Fashion ERP', description: 'Kollektionsplanung und Beschaffung.', revenue: 54000, createdon: daysAgo(52), modifiedon: daysAgo(16), _ownerid_value: OWNER_ANNA },
  { leadid: 'lead-a-15', fullname: 'Dieter Kraft', firstname: 'Dieter', lastname: 'Kraft', companyname: 'Kraft Metallbau', emailaddress1: 'd.kraft@kraft-metall.de', mobilephone: '+49 177 7890124', jobtitle: 'Inhaber', leadsourcecode: 9, statuscode: 2, statecode: 0, subject: 'Auftrags-ERP', description: 'ERP fuer Einzelfertigung und Projektgeschaeft.', revenue: 125000, createdon: daysAgo(12), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
]

// Demo opportunities - 15 per user = 45 total
const INITIAL_OPPORTUNITIES: OpportunityEntity[] = [
  // ── Sarah Schmidt's Opportunities (demo-user-001) ──
  { opportunityid: 'opp-s-01', name: 'ERP Migration TechVentures', description: 'Vollstaendige ERP-Migration auf Dynamics 365', estimatedvalue: 85000, statuscode: 1, statecode: 0, phase: 3, customerName: 'TechVentures GmbH', _originatingleadid_value: 'lead-s-01', leadName: 'Anna Mueller', createdon: daysAgo(30), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-02', name: 'Cloud Migration DataFlow', description: 'Azure Cloud Migration Projekt', estimatedvalue: 120000, statuscode: 1, statecode: 0, phase: 2, customerName: 'DataFlow AG', _originatingleadid_value: 'lead-s-02', leadName: 'Thomas Weber', createdon: daysAgo(25), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-03', name: 'D365 CloudFirst Implementation', description: 'D365 Einfuehrung fuer 200 Nutzer', estimatedvalue: 200000, statuscode: 2, statecode: 1, phase: 4, customerName: 'CloudFirst Inc', _originatingleadid_value: 'lead-s-03', leadName: 'Sarah Koch', createdon: daysAgo(45), modifiedon: daysAgo(3), actualclosedate: daysAgo(3), actualvalue: 195000, _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-04', name: 'CRM Richter & Soehne', description: 'CRM fuer 50 Mitarbeiter', estimatedvalue: 60000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Richter & Soehne KG', _originatingleadid_value: 'lead-s-04', leadName: 'Klaus Richter', createdon: daysAgo(18), modifiedon: daysAgo(3), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-05', name: 'BI Loesung DigitalWave', description: 'Power BI Integration', estimatedvalue: 35000, statuscode: 1, statecode: 0, phase: 1, customerName: 'DigitalWave GmbH', _originatingleadid_value: 'lead-s-05', leadName: 'Lisa Braun', createdon: daysAgo(14), modifiedon: daysAgo(5), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-06', name: 'IoT AutoTech Integration', description: 'IoT-Sensorik an D365', estimatedvalue: 95000, statuscode: 1, statecode: 0, phase: 3, customerName: 'AutoTech Systems', _originatingleadid_value: 'lead-s-06', leadName: 'Peter Schwarz', createdon: daysAgo(12), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-07', name: 'Finance Modul GreenEnergy', description: 'D365 Finance & Operations', estimatedvalue: 150000, statuscode: 3, statecode: 2, phase: 3, customerName: 'GreenEnergy AG', _originatingleadid_value: 'lead-s-07', leadName: 'Martina Hoffmann', createdon: daysAgo(38), modifiedon: daysAgo(8), actualclosedate: daysAgo(8), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-08', name: 'SCM Fischer Logistik', description: 'Supply Chain Digitalisierung', estimatedvalue: 70000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Fischer Logistik', _originatingleadid_value: 'lead-s-08', leadName: 'Jens Fischer', createdon: daysAgo(8), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-09', name: 'Healthcare CRM MediTech', description: 'CRM fuer Gesundheitssektor', estimatedvalue: 110000, statuscode: 1, statecode: 0, phase: 2, customerName: 'MediTech Solutions', _originatingleadid_value: 'lead-s-09', leadName: 'Claudia Lang', createdon: daysAgo(16), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-10', name: 'PM-Tool Baumann Consulting', description: 'Projektmanagement auf D365', estimatedvalue: 45000, statuscode: 2, statecode: 1, phase: 4, customerName: 'Baumann Consulting', _originatingleadid_value: 'lead-s-10', leadName: 'Robert Baumann', createdon: daysAgo(48), modifiedon: daysAgo(10), actualclosedate: daysAgo(10), actualvalue: 43000, _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-11', name: 'Marketing Automation SchreiberMedia', description: 'Marketingkampagnen automatisieren', estimatedvalue: 30000, statuscode: 1, statecode: 0, phase: 1, customerName: 'SchreiberMedia', _originatingleadid_value: 'lead-s-11', leadName: 'Eva Schreiber', createdon: daysAgo(5), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-12', name: 'Project Ops WolfBau', description: 'D365 Project Operations fuer Bau', estimatedvalue: 180000, statuscode: 1, statecode: 0, phase: 3, customerName: 'WolfBau AG', _originatingleadid_value: 'lead-s-12', leadName: 'Markus Wolf', createdon: daysAgo(20), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-13', name: 'Compliance Stein Pharma', description: 'Compliance-Tracking', estimatedvalue: 90000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Stein Pharma', _originatingleadid_value: 'lead-s-13', leadName: 'Nadine Stein', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-14', name: 'ERP Abloesung BergerTech', description: 'SAP zu D365 Migration', estimatedvalue: 250000, statuscode: 3, statecode: 2, phase: 2, customerName: 'BergerTech', _originatingleadid_value: 'lead-s-14', leadName: 'Frank Berger', createdon: daysAgo(55), modifiedon: daysAgo(15), actualclosedate: daysAgo(15), _ownerid_value: OWNER_SARAH },
  { opportunityid: 'opp-s-15', name: 'Kanzlei-Software Neumann', description: 'D365 fuer Rechtsanwaltskanzlei', estimatedvalue: 55000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Neumann & Partner', _originatingleadid_value: 'lead-s-15', leadName: 'Heike Neumann', createdon: daysAgo(10), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },

  // ── Michael Weber's Opportunities (demo-user-002) ──
  { opportunityid: 'opp-m-01', name: 'Produktionsplanung Vogel', description: 'MES-Integration mit D365 SCM', estimatedvalue: 140000, statuscode: 1, statecode: 0, phase: 3, customerName: 'Vogel Maschinenbau', _originatingleadid_value: 'lead-m-01', leadName: 'Carsten Vogel', createdon: daysAgo(26), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-02', name: 'E-Commerce StyleHouse', description: 'Shopify-D365 Anbindung', estimatedvalue: 50000, statuscode: 1, statecode: 0, phase: 1, customerName: 'StyleHouse GmbH', _originatingleadid_value: 'lead-m-02', leadName: 'Anja Krause', createdon: daysAgo(12), modifiedon: daysAgo(2), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-03', name: 'Logistik Hansen Shipping', description: 'Flottenmanagement und Routen', estimatedvalue: 175000, statuscode: 2, statecode: 1, phase: 4, customerName: 'Hansen Shipping', _originatingleadid_value: 'lead-m-03', leadName: 'Dirk Hansen', createdon: daysAgo(33), modifiedon: daysAgo(4), actualclosedate: daysAgo(4), actualvalue: 170000, _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-04', name: 'Vendor Mgmt Meier Textil', description: 'Vendor-Management Modul', estimatedvalue: 65000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Meier Textil', _originatingleadid_value: 'lead-m-04', leadName: 'Birgit Meier', createdon: daysAgo(17), modifiedon: daysAgo(3), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-05', name: 'Power Apps KoenigSoft', description: 'Power Apps fuer interne Prozesse', estimatedvalue: 40000, statuscode: 1, statecode: 0, phase: 1, customerName: 'KoenigSoft', _originatingleadid_value: 'lead-m-05', leadName: 'Stefan Koenig', createdon: daysAgo(7), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-06', name: 'Immobilien CRM Schulz', description: 'Objektverwaltung und Kundenbetreuung', estimatedvalue: 75000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Schulz Immobilien', _originatingleadid_value: 'lead-m-06', leadName: 'Monika Schulz', createdon: daysAgo(14), modifiedon: daysAgo(2), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-07', name: 'Field Service Becker Elektro', description: 'Field-Service Modul fuer Techniker', estimatedvalue: 55000, statuscode: 3, statecode: 2, phase: 2, customerName: 'Becker Elektro', _originatingleadid_value: 'lead-m-07', leadName: 'Uwe Becker', createdon: daysAgo(40), modifiedon: daysAgo(10), actualclosedate: daysAgo(10), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-08', name: 'QS Hartmann Food', description: 'Rueckverfolgbarkeit Lebensmittelkette', estimatedvalue: 95000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Hartmann Food', _originatingleadid_value: 'lead-m-08', leadName: 'Petra Hartmann', createdon: daysAgo(5), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-09', name: 'Predictive Maintenance Friedrich', description: 'Predictive Maintenance Loesung', estimatedvalue: 130000, statuscode: 1, statecode: 0, phase: 3, customerName: 'Friedrich Automotive', _originatingleadid_value: 'lead-m-09', leadName: 'Lars Friedrich', createdon: daysAgo(19), modifiedon: daysAgo(3), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-10', name: 'Kreativ-Projekte ZimmerDesign', description: 'Kreativprojekte verwalten', estimatedvalue: 28000, statuscode: 2, statecode: 1, phase: 4, customerName: 'ZimmerDesign', _originatingleadid_value: 'lead-m-10', leadName: 'Karin Zimmermann', createdon: daysAgo(36), modifiedon: daysAgo(6), actualclosedate: daysAgo(6), actualvalue: 27500, _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-11', name: 'Einkauf Jansen Stahl', description: 'Digitalisierung Einkaufsprozess', estimatedvalue: 85000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Jansen Stahl', _originatingleadid_value: 'lead-m-11', leadName: 'Ralf Jansen', createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-12', name: 'Content Mgmt LenzMedia', description: 'Content-Management und Freigaben', estimatedvalue: 48000, statuscode: 1, statecode: 0, phase: 2, customerName: 'LenzMedia Group', _originatingleadid_value: 'lead-m-12', leadName: 'Sandra Lenz', createdon: daysAgo(11), modifiedon: daysAgo(2), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-13', name: 'Sales Automation EngelTech', description: 'Vertriebsprozesse automatisieren', estimatedvalue: 62000, statuscode: 1, statecode: 0, phase: 1, customerName: 'EngelTech', _originatingleadid_value: 'lead-m-13', leadName: 'Tobias Engel', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-14', name: 'Versicherungs-CRM Horn', description: 'Kundenverwaltung Versicherungsagentur', estimatedvalue: 38000, statuscode: 3, statecode: 2, phase: 1, customerName: 'Horn Versicherungen', _originatingleadid_value: 'lead-m-14', leadName: 'Gabriele Horn', createdon: daysAgo(50), modifiedon: daysAgo(14), actualclosedate: daysAgo(14), _ownerid_value: OWNER_MICHAEL },
  { opportunityid: 'opp-m-15', name: 'LIMS Brandt Chemie', description: 'LIMS Integration mit D365', estimatedvalue: 105000, statuscode: 1, statecode: 0, phase: 3, customerName: 'Brandt Chemie', _originatingleadid_value: 'lead-m-15', leadName: 'Oliver Brandt', createdon: daysAgo(9), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },

  // ── Anna Mueller's Opportunities (demo-user-003) ──
  { opportunityid: 'opp-a-01', name: 'Energiemonitoring Roth', description: 'ISO 50001 Energiemonitoring', estimatedvalue: 72000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Roth Energie', _originatingleadid_value: 'lead-a-01', leadName: 'Christian Roth', createdon: daysAgo(24), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-02', name: 'ITSM Werner IT', description: 'IT Service Management auf D365', estimatedvalue: 58000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Werner IT Services', _originatingleadid_value: 'lead-a-02', leadName: 'Julia Werner', createdon: daysAgo(10), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-03', name: 'Baustellen-Doku Schuster', description: 'Digitale Baustellen-Dokumentation', estimatedvalue: 88000, statuscode: 2, statecode: 1, phase: 4, customerName: 'Schuster Bau', _originatingleadid_value: 'lead-a-03', leadName: 'Matthias Schuster', createdon: daysAgo(31), modifiedon: daysAgo(5), actualclosedate: daysAgo(5), actualvalue: 86000, _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-04', name: 'PMS Integration Kramer Hotels', description: 'Hotel-PMS Integration mit D365', estimatedvalue: 115000, statuscode: 1, statecode: 0, phase: 3, customerName: 'Kramer Hotels', _originatingleadid_value: 'lead-a-04', leadName: 'Susanne Kramer', createdon: daysAgo(15), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-05', name: 'Haendlerportal Beck Auto', description: 'Partnerportal fuer Autohaendler', estimatedvalue: 95000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Beck Automotive', _originatingleadid_value: 'lead-a-05', leadName: 'Andreas Beck', createdon: daysAgo(6), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-06', name: 'Regulatory Reporting Lorenz', description: 'Automatisiertes Meldewesen', estimatedvalue: 160000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Lorenz Finanz', _originatingleadid_value: 'lead-a-06', leadName: 'Kathrin Lorenz', createdon: daysAgo(21), modifiedon: daysAgo(3), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-07', name: 'CPQ Maier Werkzeuge', description: 'CPQ-Loesung Werkzeugvertrieb', estimatedvalue: 42000, statuscode: 3, statecode: 2, phase: 2, customerName: 'Maier Werkzeuge', _originatingleadid_value: 'lead-a-07', leadName: 'Holger Maier', createdon: daysAgo(45), modifiedon: daysAgo(12), actualclosedate: daysAgo(12), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-08', name: 'Studiendatenbank Franke Biotech', description: 'Verwaltung klinischer Studien', estimatedvalue: 135000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Franke Biotech', _originatingleadid_value: 'lead-a-08', leadName: 'Simone Franke', createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-09', name: 'Tourenplanung Seidel Transport', description: 'Optimierte Routenplanung', estimatedvalue: 68000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Seidel Transport', _originatingleadid_value: 'lead-a-09', leadName: 'Volker Seidel', createdon: daysAgo(13), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-10', name: 'Gastro ERP Huber', description: 'Warenwirtschaft Gastronomie', estimatedvalue: 32000, statuscode: 2, statecode: 1, phase: 4, customerName: 'Huber Gastro', _originatingleadid_value: 'lead-a-10', leadName: 'Tanja Huber', createdon: daysAgo(34), modifiedon: daysAgo(7), actualclosedate: daysAgo(7), actualvalue: 31000, _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-11', name: 'Auftragsverwaltung Paul Druck', description: 'Auftragsverwaltung Druckerei', estimatedvalue: 47000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Paul Druck', _originatingleadid_value: 'lead-a-11', leadName: 'Norbert Paul', createdon: daysAgo(7), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-12', name: 'Asset-Tracking Scholz Med', description: 'Medizingeraete-Tracking', estimatedvalue: 78000, statuscode: 1, statecode: 0, phase: 3, customerName: 'Scholz Medizintechnik', _originatingleadid_value: 'lead-a-12', leadName: 'Ingrid Scholz', createdon: daysAgo(17), modifiedon: daysAgo(3), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-13', name: 'PV-Monitoring Wendt Solar', description: 'Planung und Monitoring PV-Anlagen', estimatedvalue: 92000, statuscode: 1, statecode: 0, phase: 1, customerName: 'Wendt Solar', _originatingleadid_value: 'lead-a-13', leadName: 'Georg Wendt', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-14', name: 'Fashion ERP KleinMode', description: 'Kollektionsplanung und Beschaffung', estimatedvalue: 54000, statuscode: 3, statecode: 2, phase: 1, customerName: 'KleinMode', _originatingleadid_value: 'lead-a-14', leadName: 'Barbara Klein', createdon: daysAgo(48), modifiedon: daysAgo(13), actualclosedate: daysAgo(13), _ownerid_value: OWNER_ANNA },
  { opportunityid: 'opp-a-15', name: 'ERP Kraft Metallbau', description: 'ERP fuer Einzelfertigung', estimatedvalue: 125000, statuscode: 1, statecode: 0, phase: 2, customerName: 'Kraft Metallbau', _originatingleadid_value: 'lead-a-15', leadName: 'Dieter Kraft', createdon: daysAgo(10), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
]

// Demo tasks/follow-ups - 15 per user = 45 total
const INITIAL_TASKS: TaskEntity[] = [
  // ── Sarah Schmidt's Tasks ──
  { activityid: 'task-s-01', subject: 'Follow-up Anruf Anna Mueller', description: 'Preisinformationen nachliefern', scheduledend: daysFromNow(1), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-01', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-02', subject: 'Angebot Thomas Weber erstellen', description: 'Cloud Migration Angebot vorbereiten', scheduledend: daysFromNow(3), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-02', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-03', subject: 'Referenz senden CloudFirst', description: 'Referenzprojekte zusammenstellen', scheduledend: daysAgo(1), prioritycode: 1, statecode: 1, statuscode: 5, _regardingobjectid_value: 'lead-s-03', createdon: daysAgo(5), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-04', subject: 'Demo-Termin Klaus Richter', description: 'Live-Demo CRM buchen', scheduledend: daysFromNow(5), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-04', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-05', subject: 'Bedarfsanalyse DigitalWave', description: 'Workshop-Termin vereinbaren', scheduledend: daysFromNow(7), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-05', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-06', subject: 'PoC AutoTech vorbereiten', description: 'IoT Proof of Concept planen', scheduledend: daysFromNow(2), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-06', createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-07', subject: 'Nachfassen Jens Fischer', description: 'Entscheidungstraeger kontaktieren', scheduledend: daysFromNow(1), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-08', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-08', subject: 'Compliance Workshop MediTech', description: 'Workshop zu Datenschutz planen', scheduledend: daysFromNow(10), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-09', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-09', subject: 'Vertrag SchreiberMedia', description: 'Vertragsentwurf vorbereiten', scheduledend: daysFromNow(4), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-11', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-10', subject: 'Projektplan WolfBau', description: 'Detaillierten Projektplan erstellen', scheduledend: daysFromNow(6), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-12', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-11', subject: 'Erstgespraech Stein Pharma', description: 'Kennenlernen und Anforderungen', scheduledend: daysFromNow(2), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-13', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-12', subject: 'Statusupdate Heike Neumann', description: 'Fortschritt besprechen', scheduledend: daysAgo(2), prioritycode: 1, statecode: 1, statuscode: 5, _regardingobjectid_value: 'lead-s-15', createdon: daysAgo(5), modifiedon: daysAgo(2), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-13', subject: 'Preiskalkulation IoT', description: 'Kostenvoranschlag fuer Sensorik', scheduledend: daysFromNow(3), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-06', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-14', subject: 'Feedback SCM-Angebot', description: 'Rueckmeldung zum Angebot einholen', scheduledend: daysFromNow(1), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-s-08', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },
  { activityid: 'task-s-15', subject: 'Quartalsreview Leads', description: 'Alle offenen Leads ueberpruefen', scheduledend: daysFromNow(14), prioritycode: 0, statecode: 0, statuscode: 2, createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_SARAH },

  // ── Michael Weber's Tasks ──
  { activityid: 'task-m-01', subject: 'Termin Carsten Vogel', description: 'Vor-Ort-Besichtigung Produktion', scheduledend: daysFromNow(2), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-01', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-02', subject: 'E-Commerce Konzept StyleHouse', description: 'Integrationskonzept erstellen', scheduledend: daysFromNow(5), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-02', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-03', subject: 'Rollout-Plan Hansen', description: 'Stufenweisen Rollout planen', scheduledend: daysAgo(3), prioritycode: 2, statecode: 1, statuscode: 5, _regardingobjectid_value: 'lead-m-03', createdon: daysAgo(8), modifiedon: daysAgo(3), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-04', subject: 'Lieferanten-Workshop Meier', description: 'Workshop mit Lieferanten planen', scheduledend: daysFromNow(4), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-04', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-05', subject: 'Power Apps Demo KoenigSoft', description: 'Prototyp vorfuehren', scheduledend: daysFromNow(1), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-05', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-06', subject: 'Immobilien CRM Praesentation', description: 'Loesung praesentieren', scheduledend: daysFromNow(6), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-06', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-07', subject: 'QS-Anforderungen Hartmann', description: 'Detailierte Anforderungen aufnehmen', scheduledend: daysFromNow(3), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-08', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-08', subject: 'PoC Predictive Maintenance', description: 'Machbarkeitsstudie erstellen', scheduledend: daysFromNow(8), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-09', createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-09', subject: 'Nachfassen Jansen Stahl', description: 'Budgetfreigabe abfragen', scheduledend: daysFromNow(1), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-11', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-10', subject: 'Content Workflow LenzMedia', description: 'Prozessanalyse durchfuehren', scheduledend: daysFromNow(4), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-12', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-11', subject: 'Erstgespraech Tobias Engel', description: 'Anforderungen aufnehmen', scheduledend: daysFromNow(1), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-13', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-12', subject: 'LIMS Spezifikation Brandt', description: 'Technische Spezifikation erstellen', scheduledend: daysFromNow(7), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-15', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-13', subject: 'Angebot E-Commerce', description: 'Shopify-Angebot fertigstellen', scheduledend: daysFromNow(2), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-m-02', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-14', subject: 'Vendor Mgmt Freigabe', description: 'Freigabe vom Einkauf einholen', scheduledend: daysAgo(1), prioritycode: 1, statecode: 1, statuscode: 5, _regardingobjectid_value: 'lead-m-04', createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },
  { activityid: 'task-m-15', subject: 'Pipeline Review Q1', description: 'Quartals-Pipeline ueberpruefen', scheduledend: daysFromNow(10), prioritycode: 0, statecode: 0, statuscode: 2, createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_MICHAEL },

  // ── Anna Mueller's Tasks ──
  { activityid: 'task-a-01', subject: 'Energie-Audit Roth', description: 'Erstaudit fuer ISO 50001', scheduledend: daysFromNow(3), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-01', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-02', subject: 'ITSM Demo Werner IT', description: 'Online-Demo buchen', scheduledend: daysFromNow(2), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-02', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-03', subject: 'Abschluss Schuster Bau', description: 'Vertrag finalisieren', scheduledend: daysAgo(4), prioritycode: 2, statecode: 1, statuscode: 5, _regardingobjectid_value: 'lead-a-03', createdon: daysAgo(10), modifiedon: daysAgo(4), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-04', subject: 'PMS Anforderungen Kramer', description: 'Schnittstellenanforderungen klären', scheduledend: daysFromNow(5), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-04', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-05', subject: 'Portalkonzept Beck Auto', description: 'Konzept fuer Haendlerportal', scheduledend: daysFromNow(7), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-05', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-06', subject: 'Compliance-Meeting Lorenz', description: 'Regulatorische Anforderungen besprechen', scheduledend: daysFromNow(1), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-06', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-07', subject: 'Studien-Workshop Franke', description: 'Workshop klinische Studien', scheduledend: daysFromNow(4), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-08', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-08', subject: 'Routenplanung Seidel', description: 'Test-Szenario vorbereiten', scheduledend: daysFromNow(6), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-09', createdon: daysAgo(3), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-09', subject: 'Nachfassen Paul Druck', description: 'Entscheidung erfragen', scheduledend: daysFromNow(1), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-11', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-10', subject: 'Asset-Tracking PoC Scholz', description: 'Prototyp Tag-System testen', scheduledend: daysFromNow(8), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-12', createdon: daysAgo(4), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-11', subject: 'Solar-Monitoring Konzept', description: 'Technisches Konzept PV-Monitoring', scheduledend: daysFromNow(3), prioritycode: 1, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-13', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-12', subject: 'ERP Angebot Kraft Metallbau', description: 'Detailliertes Angebot erstellen', scheduledend: daysFromNow(5), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-15', createdon: daysAgo(2), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-13', subject: 'Hotel-Demo Termin', description: 'Live-Demo PMS-Integration', scheduledend: daysFromNow(2), prioritycode: 2, statecode: 0, statuscode: 2, _regardingobjectid_value: 'lead-a-04', createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-14', subject: 'Budgetfreigabe Roth Energie', description: 'Budget mit GF besprechen', scheduledend: daysAgo(2), prioritycode: 1, statecode: 1, statuscode: 5, _regardingobjectid_value: 'lead-a-01', createdon: daysAgo(6), modifiedon: daysAgo(2), _ownerid_value: OWNER_ANNA },
  { activityid: 'task-a-15', subject: 'Monatsreport Leads', description: 'Monatlichen Lead-Report erstellen', scheduledend: daysFromNow(12), prioritycode: 0, statecode: 0, statuscode: 2, createdon: daysAgo(1), modifiedon: daysAgo(1), _ownerid_value: OWNER_ANNA },
]

export class MockDataverseClient {
  private delay = 300 // Simulate network delay

  private async simulateDelay() {
    await new Promise((resolve) => setTimeout(resolve, this.delay))
  }

  private getLeadsFromStorage(): LeadEntity[] {
    if (typeof window === 'undefined') return INITIAL_LEADS
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS))
      return INITIAL_LEADS
    }
    return JSON.parse(stored)
  }

  private saveLeadsToStorage(leads: LeadEntity[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }

  private getTasksFromStorage(): TaskEntity[] {
    if (typeof window === 'undefined') return INITIAL_TASKS
    const stored = localStorage.getItem(STORAGE_KEY_TASKS)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS))
      return INITIAL_TASKS
    }
    return JSON.parse(stored)
  }

  private saveTasksToStorage(tasks: TaskEntity[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))
  }

  async createLead(payload: LeadCreateDto): Promise<LeadEntity> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const newLead: LeadEntity = {
      leadid: `lead-${Date.now()}`,
      fullname: `${payload.firstname || ''} ${payload.lastname || ''}`.trim(),
      firstname: payload.firstname,
      lastname: payload.lastname,
      companyname: payload.companyname,
      emailaddress1: payload.emailaddress1 || '',
      mobilephone: payload.mobilephone || '',
      telephone1: payload.telephone1,
      jobtitle: payload.jobtitle,
      leadsourcecode: payload.leadsourcecode || 1,
      statuscode: 1,
      statecode: 0,
      subject: payload.subject,
      description: payload.description,
      revenue: payload.revenue,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    leads.unshift(newLead)
    this.saveLeadsToStorage(leads)
    return newLead
  }

  async updateLead(id: string, patch: LeadUpdateDto): Promise<void> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const index = leads.findIndex((l) => l.leadid === id)
    if (index === -1) throw new Error('Lead not found')

    leads[index] = {
      ...leads[index],
      ...patch,
      modifiedon: new Date().toISOString(),
    }
    this.saveLeadsToStorage(leads)
  }

  async getLead(id: string): Promise<LeadEntity> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const lead = leads.find((l) => l.leadid === id)
    if (!lead) throw new Error('Lead not found')
    return lead
  }

  async getLeads(opts: {
    top?: number
    search?: string
    filter?: string
    orderBy?: string
  } = {}): Promise<ODataCollectionResponse<LeadEntity>> {
    await this.simulateDelay()
    let leads = this.getLeadsFromStorage()

    // Apply search filter
    if (opts.search) {
      const search = opts.search.toLowerCase()
      leads = leads.filter(
        (l) =>
          l.fullname?.toLowerCase().includes(search) ||
          l.companyname?.toLowerCase().includes(search) ||
          l.emailaddress1?.toLowerCase().includes(search)
      )
    }

    // Apply top limit
    const top = opts.top ?? DEFAULT_PAGE_SIZE
    leads = leads.slice(0, top)

    return {
      value: leads,
    }
  }

  async createTaskFollowUp(
    leadId: string,
    dto: TaskCreateDto
  ): Promise<TaskEntity> {
    await this.simulateDelay()
    const tasks = this.getTasksFromStorage()
    const newTask: TaskEntity = {
      activityid: `task-${Date.now()}`,
      subject: dto.subject,
      description: dto.description,
      scheduledstart: dto.scheduledstart,
      scheduledend: dto.scheduledend,
      prioritycode: dto.prioritycode || 1,
      statecode: 0,
      statuscode: 2,
      _regardingobjectid_value: leadId,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    tasks.push(newTask)
    this.saveTasksToStorage(tasks)
    return newTask
  }

  async completeTask(taskId: string): Promise<void> {
    await this.simulateDelay()
    const tasks = this.getTasksFromStorage()
    const index = tasks.findIndex((t) => t.activityid === taskId)
    if (index === -1) throw new Error('Task not found')

    tasks[index] = {
      ...tasks[index],
      statecode: 1,
      statuscode: 5,
      modifiedon: new Date().toISOString(),
    }
    this.saveTasksToStorage(tasks)
  }

  async getLeadTasks(
    leadId: string,
    top = 20
  ): Promise<ODataCollectionResponse<TaskEntity>> {
    await this.simulateDelay()
    const tasks = this.getTasksFromStorage()
    const filtered = tasks
      .filter((t) => t._regardingobjectid_value === leadId)
      .slice(0, top)

    return {
      value: filtered,
    }
  }

  async listLeadActivities(
    leadId: string,
    top = 20
  ): Promise<ODataCollectionResponse<ActivityEntity>> {
    await this.simulateDelay()
    // For now, return empty activities in mock mode
    return {
      value: [],
    }
  }

  // ── Opportunities ──

  private getOpportunitiesFromStorage(): OpportunityEntity[] {
    if (typeof window === 'undefined') return INITIAL_OPPORTUNITIES
    const stored = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(INITIAL_OPPORTUNITIES))
      return INITIAL_OPPORTUNITIES
    }
    return JSON.parse(stored)
  }

  private saveOpportunitiesToStorage(opps: OpportunityEntity[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(opps))
  }

  async createOpportunity(dto: OpportunityCreateDto): Promise<OpportunityEntity> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const newOpp: OpportunityEntity = {
      opportunityid: `opp-${Date.now()}`,
      name: dto.name,
      description: dto.description,
      estimatedvalue: dto.estimatedvalue,
      statuscode: OPPORTUNITY_STATUS.OPEN,
      statecode: 0,
      phase: dto.phase ?? OPPORTUNITY_PHASES.NEU,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }
    opps.unshift(newOpp)
    this.saveOpportunitiesToStorage(opps)
    return newOpp
  }

  async updateOpportunity(id: string, patch: OpportunityUpdateDto): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')
    opps[index] = {
      ...opps[index],
      ...patch,
      modifiedon: new Date().toISOString(),
    }
    this.saveOpportunitiesToStorage(opps)
  }

  async getOpportunity(id: string): Promise<OpportunityEntity> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const opp = opps.find((o) => o.opportunityid === id)
    if (!opp) throw new Error('Opportunity not found')
    return opp
  }

  async getOpportunities(opts: {
    top?: number
    search?: string
    filter?: string
    orderBy?: string
  } = {}): Promise<ODataCollectionResponse<OpportunityEntity>> {
    await this.simulateDelay()
    let opps = this.getOpportunitiesFromStorage()

    if (opts.search) {
      const search = opts.search.toLowerCase()
      opps = opps.filter(
        (o) =>
          o.name?.toLowerCase().includes(search) ||
          o.customerName?.toLowerCase().includes(search) ||
          o.description?.toLowerCase().includes(search)
      )
    }

    const top = opts.top ?? DEFAULT_PAGE_SIZE
    opps = opps.slice(0, top)

    return { value: opps }
  }

  async setOpportunityPhase(id: string, phase: number): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')

    opps[index].phase = phase
    opps[index].modifiedon = new Date().toISOString()

    // Auto-close as won if phase = 4 (Gewonnen)
    if (phase === OPPORTUNITY_PHASES.GEWONNEN) {
      opps[index].statuscode = OPPORTUNITY_STATUS.WON
      opps[index].statecode = 1
      opps[index].actualclosedate = new Date().toISOString()
      opps[index].actualvalue = opps[index].estimatedvalue
    }

    this.saveOpportunitiesToStorage(opps)
  }

  async closeOpportunityAsWon(id: string, actualValue?: number): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')

    opps[index].phase = OPPORTUNITY_PHASES.GEWONNEN
    opps[index].statuscode = OPPORTUNITY_STATUS.WON
    opps[index].statecode = 1
    opps[index].actualclosedate = new Date().toISOString()
    opps[index].actualvalue = actualValue ?? opps[index].estimatedvalue
    opps[index].modifiedon = new Date().toISOString()
    this.saveOpportunitiesToStorage(opps)
  }

  async closeOpportunityAsLost(id: string): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')

    opps[index].statuscode = OPPORTUNITY_STATUS.LOST
    opps[index].statecode = 2
    opps[index].actualclosedate = new Date().toISOString()
    opps[index].modifiedon = new Date().toISOString()
    this.saveOpportunitiesToStorage(opps)
  }

  async createOpportunityFromLead(leadId: string): Promise<OpportunityEntity> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const lead = leads.find((l) => l.leadid === leadId)
    if (!lead) throw new Error('Lead not found')

    const opps = this.getOpportunitiesFromStorage()
    const newOpp: OpportunityEntity = {
      opportunityid: `opp-${Date.now()}`,
      name: lead.subject || `Opportunity - ${lead.fullname || lead.companyname}`,
      description: lead.description,
      estimatedvalue: lead.revenue,
      statuscode: OPPORTUNITY_STATUS.OPEN,
      statecode: 0,
      phase: OPPORTUNITY_PHASES.NEU,
      _originatingleadid_value: lead.leadid,
      leadName: lead.fullname,
      customerName: lead.companyname,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }
    opps.unshift(newOpp)
    this.saveOpportunitiesToStorage(opps)
    return newOpp
  }
}
