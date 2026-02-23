// ============================================================
// SCREENPLAY TYPES
// ============================================================

export type ElementType =
  | 'scene-heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot'
  | 'centered'
  | 'note';

export interface ScriptElement {
  id: string;
  type: ElementType;
  content: string;
  sceneNumber?: string; // custom scene number override for scene-heading elements
}

export interface Scene {
  id: string;
  number: number;
  heading: string;
  interior: 'INT.' | 'EXT.' | 'INT./EXT.' | 'I/E.';
  location: string;
  timeOfDay: string;
  elements: ScriptElement[];
  color?: string;
  notes?: string;
  pageStart?: number;
  tags?: string[];
  breakdown?: BreakdownItem[];
}

export interface Script {
  id: string;
  title: string;
  author: string;
  contact?: string;
  draftDate?: string;
  revisionColor?: string;
  scenes: Scene[];
  elements: ScriptElement[]; // flat list for the editor
  pageCount: number;
  wga?: string;
  copyright?: string;
  basedOn?: string;
}

// ============================================================
// BREAKDOWN TYPES
// ============================================================

export type BreakdownCategory =
  | 'cast'
  | 'extras'
  | 'props'
  | 'wardrobe'
  | 'makeup'
  | 'vehicles'
  | 'sfx'
  | 'sound'
  | 'camera'
  | 'stunts'
  | 'animals'
  | 'location'
  | 'notes';

export const BREAKDOWN_COLORS: Record<BreakdownCategory, { bg: string; text: string; label: string }> = {
  cast:     { bg: '#fde68a', text: '#92400e', label: 'Cast' },
  extras:   { bg: '#d1fae5', text: '#065f46', label: 'Extras/BG' },
  props:    { bg: '#dbeafe', text: '#1e40af', label: 'Props' },
  wardrobe: { bg: '#ede9fe', text: '#5b21b6', label: 'Wardrobe' },
  makeup:   { bg: '#fce7f3', text: '#9d174d', label: 'Makeup/Hair' },
  vehicles: { bg: '#ffedd5', text: '#9a3412', label: 'Vehicles' },
  sfx:      { bg: '#fee2e2', text: '#991b1b', label: 'SFX/VFX' },
  sound:    { bg: '#ecfdf5', text: '#064e3b', label: 'Sound' },
  camera:   { bg: '#f0f9ff', text: '#0c4a6e', label: 'Camera/Grip' },
  stunts:   { bg: '#fef9c3', text: '#713f12', label: 'Stunts' },
  animals:  { bg: '#f0fdf4', text: '#14532d', label: 'Animals' },
  location: { bg: '#fdf4ff', text: '#581c87', label: 'Location' },
  notes:    { bg: '#f1f5f9', text: '#475569', label: 'Notes' },
};

export interface BreakdownItem {
  id: string;
  sceneId: string;
  category: BreakdownCategory;
  name: string;
  description?: string;
  quantity?: number;
  notes?: string;
}

// ============================================================
// CAST / CHARACTERS
// ============================================================

export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Other' | 'Unspecified';

export interface Character {
  id: string;
  name: string;
  type: 'Principal' | 'Supporting' | 'Day Player' | 'Extra';
  description?: string;
  gender?: Gender;
  ageRange?: string;
  notes?: string;
  scenes?: string[]; // scene IDs
  actor?: string;
  contactInfo?: string;
  agencyPhone?: string;
  dailyRate?: number;
  avatar?: string;
}

// ============================================================
// LOCATIONS
// ============================================================

export interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT' | 'INT/EXT';
  address?: string;
  contactName?: string;
  contactPhone?: string;
  permitRequired?: boolean;
  permitStatus?: 'Pending' | 'Approved' | 'Denied' | 'Not Required';
  notes?: string;
  scenes?: string[];
  parkingNotes?: string;
  nearestHospital?: string;
  lat?: number;
  lng?: number;
}

// ============================================================
// PRODUCTION SCHEDULING
// ============================================================

export interface ScheduleScene {
  id: string;
  sceneId: string;
  order: number;
  estPages: number;
  estHours: number;
  dayBannerBefore?: boolean;
}

export interface ProductionDay {
  id: string;
  date: string; // ISO
  label: string;
  scenes: ScheduleScene[];
  generalCall?: string;
  crewCall?: string;
  shootCall?: string;
  locationId?: string;
  notes?: string;
  crew?: string[];
}

// ============================================================
// SHOT LIST
// ============================================================

export type ShotSize = 'ECU' | 'CU' | 'MCU' | 'MS' | 'MLS' | 'FS' | 'LS' | 'ELS' | 'OTS' | 'POV' | 'INSERT';
export type CameraAngle = 'Eye Level' | 'High Angle' | 'Low Angle' | 'Dutch/Canted' | 'Overhead' | 'Worms Eye';
export type CameraMovement = 'Static' | 'Pan' | 'Tilt' | 'Dolly In' | 'Dolly Out' | 'Track/Follow' | 'Crane' | 'Handheld' | 'Steadicam' | 'Zoom In' | 'Zoom Out' | 'Arc';

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: string;
  description: string;
  size: ShotSize;
  angle: CameraAngle;
  movement: CameraMovement;
  lens?: string;
  frameRate?: string;
  notes?: string;
  characters?: string[];
  checked?: boolean;
  duration?: string; // estimated duration
}

// ============================================================
// CALL SHEET
// ============================================================

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  email?: string;
  call?: string; // call time
  notes?: string;
}

export interface CastCall {
  characterId: string;
  characterName: string;
  actorName?: string;
  reportTime?: string;
  makeupCall?: string;
  wardrobeCall?: string;
  setCall?: string;
  notes?: string;
}

export interface CallSheet {
  id: string;
  date: string;
  shootDay: number;
  productionName: string;
  director: string;
  producer?: string;
  productionCompany?: string;
  nearestHospital?: string;
  emergencyNumber?: string;
  generalCall: string;
  crewCall: string;
  locationId?: string;
  locationAddress?: string;
  scenes: string[]; // scene IDs being shot
  castCalls: CastCall[];
  crew: CrewMember[];
  weather?: string;
  sunrise?: string;
  sunset?: string;
  notes?: string;
  advanceSchedule?: string; // next day schedule note
}

// ============================================================
// PROJECT
// ============================================================

export interface Project {
  id: string;
  name: string;
  genre?: string;
  format?: 'Feature' | 'Short' | 'Pilot' | 'Series' | 'Documentary' | 'Commercial';
  director?: string;
  producer?: string;
  dp?: string;
  productionCompany?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  logline?: string;
  synopsis?: string;
  script: Script;
  breakdownItems: BreakdownItem[];
  characters: Character[];
  locations: Location[];
  productionDays: ProductionDay[];
  shots: Shot[];
  callSheets: CallSheet[];
  crew: CrewMember[];
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// COLLABORATION
// ============================================================

export type CollaboratorRole = 'Owner' | 'Writer' | 'Editor' | 'Viewer';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  addedAt: string;
  lastSeen?: string;
}

// ============================================================
// CHAT TYPES
// ============================================================

export type ChatDepartment =
  | 'Camera'
  | 'Art'
  | 'Wardrobe'
  | 'Sound'
  | 'Makeup & Hair'
  | 'Production'
  | 'VFX'
  | 'Stunts'
  | 'Locations';

export const CHAT_DEPARTMENTS: ChatDepartment[] = [
  'Camera', 'Art', 'Wardrobe', 'Sound', 'Makeup & Hair',
  'Production', 'VFX', 'Stunts', 'Locations',
];

export interface ChatMessage {
  id: string;
  roomId: string;         // channelId or dmId
  senderId: string;
  senderName: string;
  senderDepartment?: string;
  content: string;
  timestamp: string;
  edited?: boolean;
  reactions?: Record<string, string[]>; // emoji → array of userIds
}

export interface ChatDM {
  id: string;
  participantIds: string[];
  participantNames: string[];
}

export interface ChatUser {
  id: string;
  name: string;
  role: string;
  department: string;
}

// ============================================================
// UI TYPES
// ============================================================

export type AppView =
  | 'dashboard'
  | 'screenplay'
  | 'breakdown'
  | 'schedule'
  | 'shotlist'
  | 'callsheet'
  | 'characters'
  | 'locations'
  | 'reports'
  | 'chat';

export type RevisionColor = 'White' | 'Blue' | 'Pink' | 'Yellow' | 'Green' | 'Goldenrod' | 'Buff' | 'Salmon';
export const REVISION_COLORS: { name: RevisionColor; hex: string }[] = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Blue', hex: '#cfe2ff' },
  { name: 'Pink', hex: '#fce7f3' },
  { name: 'Yellow', hex: '#fef9c3' },
  { name: 'Green', hex: '#dcfce7' },
  { name: 'Goldenrod', hex: '#fef3c7' },
  { name: 'Buff', hex: '#fef3e2' },
  { name: 'Salmon', hex: '#fee2e2' },
];
