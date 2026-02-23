import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, Script, Scene, ScriptElement, Character, Location,
  ProductionDay, Shot, CallSheet, CrewMember, BreakdownItem,
  Collaborator, AppView, ChatMessage, ChatDM, ChatUser
} from '../types';
import { socket } from '../utils/socket';
import { v4 as uuid } from '../utils/uuid';

// ─── Demo Project ────────────────────────────────────────────
const demoElements: ScriptElement[] = [
  { id: uuid(), type: 'scene-heading', content: 'INT. GOLDEN GLOBE DINER - NIGHT' },
  { id: uuid(), type: 'action', content: 'Rain hammers the windows. A lone neon sign flickers. JAMES COLE (30s, weathered, haunted eyes) slides into a cracked vinyl booth.' },
  { id: uuid(), type: 'character', content: 'JAMES' },
  { id: uuid(), type: 'dialogue', content: "You ever get the feeling the city's trying to tell you something?" },
  { id: uuid(), type: 'character', content: 'VERA' },
  { id: uuid(), type: 'parenthetical', content: '(sliding a coffee across)' },
  { id: uuid(), type: 'dialogue', content: "It's telling you to tip better." },
  { id: uuid(), type: 'action', content: "James smiles — the first real smile we'll see from him." },
  { id: uuid(), type: 'scene-heading', content: 'EXT. DOWNTOWN ALLEY - CONTINUOUS' },
  { id: uuid(), type: 'action', content: 'A FIGURE in a dark coat watches the diner from across the street. Checks a photo. Pockets it.' },
  { id: uuid(), type: 'transition', content: 'CUT TO:' },
  { id: uuid(), type: 'scene-heading', content: 'INT. POLICE PRECINCT - BULLPEN - DAY' },
  { id: uuid(), type: 'action', content: "Fluorescent lights hum above rows of cluttered desks. CAPTAIN RHODES (50s, salt-and-pepper, no-nonsense) drops a thick case file on James's desk." },
  { id: uuid(), type: 'character', content: 'CAPTAIN RHODES' },
  { id: uuid(), type: 'dialogue', content: "Missing persons. Three of them. All connected to the Ashwood Building.\n\nYour old stomping ground, Cole." },
  { id: uuid(), type: 'character', content: 'JAMES' },
  { id: uuid(), type: 'parenthetical', content: '(not touching the file)' },
  { id: uuid(), type: 'dialogue', content: "I'm done with Ashwood." },
  { id: uuid(), type: 'character', content: 'CAPTAIN RHODES' },
  { id: uuid(), type: 'dialogue', content: "Ashwood isn't done with you." },
];

function buildScenesFromElements(elements: ScriptElement[]): Scene[] {
  const scenes: Scene[] = [];
  let currentScene: Scene | null = null;
  let sceneNum = 1;

  elements.forEach(el => {
    if (el.type === 'scene-heading') {
      if (currentScene) scenes.push(currentScene);
      const parts = el.content.split(/\s*-\s*/);
      const loc = parts[0]?.trim() ?? el.content;
      const time = parts[1]?.trim() ?? 'DAY';
      const interior = loc.startsWith('INT./EXT.') || loc.startsWith('I/E.')
        ? 'INT./EXT.'
        : loc.startsWith('INT.')
        ? 'INT.'
        : loc.startsWith('EXT.')
        ? 'EXT.'
        : 'INT.';
      currentScene = {
        id: uuid(),
        number: sceneNum++,
        heading: el.content,
        interior: interior as Scene['interior'],
        location: loc,
        timeOfDay: time,
        elements: [el],
        breakdown: [],
        tags: [],
      };
    } else if (currentScene) {
      currentScene.elements.push(el);
    }
  });
  if (currentScene) scenes.push(currentScene);
  return scenes;
}

const scenes = buildScenesFromElements(demoElements);

const demoScript: Script = {
  id: uuid(),
  title: 'NEON SHADOWS',
  author: 'Your Name',
  draftDate: 'Feb 2026',
  revisionColor: 'White',
  scenes,
  elements: demoElements,
  pageCount: Math.ceil(demoElements.length / 8),
};

const demoProject: Project = {
  id: uuid(),
  name: 'Neon Shadows',
  genre: 'Neo-Noir Thriller',
  format: 'Feature',
  director: 'Your Name',
  producer: '',
  dp: '',
  productionCompany: 'FilmCraft Productions',
  startDate: '2026-04-01',
  endDate: '2026-06-30',
  budget: 500000,
  logline: 'A burned-out detective is pulled back into the city\'s darkest corners when a string of disappearances leads to a conspiracy reaching the highest levels of power.',
  synopsis: '',
  script: demoScript,
  breakdownItems: [],
  characters: [
    {
      id: uuid(), name: 'JAMES COLE', type: 'Principal',
      description: 'Weathered detective haunted by his past. 30s, magnetic but broken.',
      gender: 'Male', ageRange: '30-40', scenes: [],
    },
    {
      id: uuid(), name: 'VERA', type: 'Supporting',
      description: 'Diner waitress. Sharp, warm, hiding something.',
      gender: 'Female', ageRange: '25-35', scenes: [],
    },
    {
      id: uuid(), name: 'CAPTAIN RHODES', type: 'Supporting',
      description: 'James\'s boss. Old school, conflicted loyalties.',
      gender: 'Male', ageRange: '50-60', scenes: [],
    },
  ],
  locations: [
    {
      id: uuid(), name: 'Golden Globe Diner', type: 'INT',
      address: '1247 Neon Ave, Los Angeles, CA 90028',
      permitRequired: true, permitStatus: 'Pending',
      notes: 'Night shoot. Practical neon lights required.',
    },
    {
      id: uuid(), name: 'Downtown Alley', type: 'EXT',
      address: 'Spring St & 5th, DTLA',
      permitRequired: true, permitStatus: 'Approved',
    },
    {
      id: uuid(), name: 'Police Precinct Bullpen', type: 'INT',
      address: 'Studio Stage 4, Burbank',
      permitRequired: false, permitStatus: 'Not Required',
    },
  ],
  productionDays: [
    {
      id: uuid(), date: '2026-04-01', label: 'Day 1',
      generalCall: '06:00', crewCall: '06:30',
      scenes: [{ id: uuid(), sceneId: scenes[0]?.id ?? '', order: 1, estPages: 2, estHours: 4 }],
      notes: 'Night-for-night exteriors. Rain machines on standby.',
    },
    {
      id: uuid(), date: '2026-04-02', label: 'Day 2',
      generalCall: '07:00', crewCall: '07:30',
      scenes: [{ id: uuid(), sceneId: scenes[1]?.id ?? '', order: 1, estPages: 1.5, estHours: 3 }],
    },
    {
      id: uuid(), date: '2026-04-03', label: 'Day 3',
      generalCall: '06:00', crewCall: '06:30',
      scenes: [{ id: uuid(), sceneId: scenes[2]?.id ?? '', order: 1, estPages: 3, estHours: 6 }],
    },
  ] as unknown as ProductionDay[],
  shots: [],
  callSheets: [],
  collaborators: [],
  crew: [
    { id: uuid(), name: 'Alex Rivera', role: 'Director of Photography', department: 'Camera', phone: '(310) 555-0101' },
    { id: uuid(), name: 'Sam Chen', role: '1st AD', department: 'Production', phone: '(310) 555-0102' },
    { id: uuid(), name: 'Jordan Lee', role: 'Production Designer', department: 'Art', phone: '(310) 555-0103' },
    { id: uuid(), name: 'Taylor Moore', role: 'Sound Mixer', department: 'Sound', phone: '(310) 555-0104' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Store Interface ─────────────────────────────────────────
interface AppState {
  projects: Project[];
  activeProjectId: string;
  activeView: AppView;
  activeSceneId: string | null;
  sidebarCollapsed: boolean;

  // Derived / computed
  activeProject: () => Project;

  // Navigation
  setView: (view: AppView) => void;
  setActiveScene: (id: string | null) => void;
  toggleSidebar: () => void;

  // Project
  createProject: (name: string) => void;
  updateProject: (updates: Partial<Project>) => void;
  setActiveProject: (id: string) => void;

  // Script elements
  updateElements: (elements: ScriptElement[]) => void;
  updateScriptMeta: (meta: Partial<Pick<Script, 'title' | 'author' | 'draftDate' | 'revisionColor' | 'contact' | 'wga' | 'copyright' | 'basedOn'>>) => void;

  // Breakdown
  addBreakdownItem: (item: Omit<BreakdownItem, 'id'>) => void;
  updateBreakdownItem: (id: string, updates: Partial<BreakdownItem>) => void;
  deleteBreakdownItem: (id: string) => void;

  // Characters
  addCharacter: (char: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  // Locations
  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Production Days
  addProductionDay: (day: Omit<ProductionDay, 'id'>) => void;
  updateProductionDay: (id: string, updates: Partial<ProductionDay>) => void;
  deleteProductionDay: (id: string) => void;
  reorderDays: (days: ProductionDay[]) => void;

  // Shots
  addShot: (shot: Omit<Shot, 'id'>) => void;
  updateShot: (id: string, updates: Partial<Shot>) => void;
  deleteShot: (id: string) => void;

  // Crew
  addCrew: (member: Omit<CrewMember, 'id'>) => void;
  updateCrew: (id: string, updates: Partial<CrewMember>) => void;
  deleteCrew: (id: string) => void;

  // Call Sheets
  createCallSheet: (sheet: Omit<CallSheet, 'id'>) => void;
  updateCallSheet: (id: string, updates: Partial<CallSheet>) => void;
  deleteCallSheet: (id: string) => void;

  // Collaborators
  addCollaborator: (collab: Omit<Collaborator, 'id' | 'addedAt'>) => void;
  updateCollaborator: (id: string, updates: Partial<Collaborator>) => void;
  removeCollaborator: (id: string) => void;

  // Chat
  chatCurrentUser: ChatUser | null;
  chatMessages: Record<string, ChatMessage[]>;  // keyed by roomId
  chatDms: ChatDM[];
  activeChatChannelId: string;
  activeDmId: string | null;
  socketConnected: boolean;
  onlineMembers: ChatUser[];  // currently online users in the active project

  setChatUser: (user: ChatUser | null) => void;
  sendChatMessage: (roomId: string, content: string) => void;
  addReaction: (roomId: string, messageId: string, emoji: string) => void;
  setActiveChatChannel: (id: string) => void;
  startOrOpenDM: (otherUser: ChatUser) => void;
  setActiveDm: (id: string | null) => void;

  // Socket receive actions (called by useChatSocket hook)
  receiveMessage: (message: ChatMessage) => void;
  setRoomHistory: (roomId: string, messages: ChatMessage[]) => void;
  receiveReactionUpdate: (roomId: string, messageId: string, reactions: Record<string, string[]>) => void;
  setSocketConnected: (connected: boolean) => void;
  setOnlineMembers: (members: ChatUser[]) => void;
}

function updateActiveProject(state: AppState, updater: (p: Project) => Project): Partial<AppState> {
  const updated = state.projects.map(p =>
    p.id === state.activeProjectId ? updater(p) : p
  );
  return { projects: updated };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [demoProject],
      activeProjectId: demoProject.id,
      activeView: 'dashboard',
      activeSceneId: null,
      sidebarCollapsed: false,

      // Chat
      chatCurrentUser: null,
      chatMessages: {},
      chatDms: [],
      activeChatChannelId: `${demoProject.id}:general`,
      activeDmId: null,
      socketConnected: false,
      onlineMembers: [],

      activeProject: () => {
        const s = get();
        return s.projects.find(p => p.id === s.activeProjectId) ?? s.projects[0];
      },

      setView: (view) => set({ activeView: view }),
      setActiveScene: (id) => set({ activeSceneId: id }),
      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      createProject: (name) => {
        const script: Script = {
          id: uuid(), title: name, author: '', scenes: [], elements: [], pageCount: 0,
        };
        const project: Project = {
          id: uuid(), name, script,
          breakdownItems: [], characters: [], locations: [],
          productionDays: [], shots: [], callSheets: [], crew: [],
          collaborators: [],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        set(s => ({ projects: [...s.projects, project], activeProjectId: project.id, activeView: 'screenplay' }));
      },

      updateProject: (updates) => set(s => updateActiveProject(s, p => ({
        ...p, ...updates, updatedAt: new Date().toISOString()
      }))),

      setActiveProject: (id) => set({ activeProjectId: id }),

      updateElements: (elements) => set(s => updateActiveProject(s, p => {
        const scenes = buildScenesFromElements(elements);
        return {
          ...p,
          script: {
            ...p.script,
            elements,
            scenes,
            pageCount: Math.max(1, Math.ceil(elements.length / 8)),
          },
          updatedAt: new Date().toISOString(),
        };
      })),

      updateScriptMeta: (meta) => set(s => updateActiveProject(s, p => ({
        ...p, script: { ...p.script, ...meta }, updatedAt: new Date().toISOString()
      }))),

      addBreakdownItem: (item) => set(s => updateActiveProject(s, p => ({
        ...p, breakdownItems: [...p.breakdownItems, { ...item, id: uuid() }]
      }))),
      updateBreakdownItem: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, breakdownItems: p.breakdownItems.map(b => b.id === id ? { ...b, ...updates } : b)
      }))),
      deleteBreakdownItem: (id) => set(s => updateActiveProject(s, p => ({
        ...p, breakdownItems: p.breakdownItems.filter(b => b.id !== id)
      }))),

      addCharacter: (char) => set(s => updateActiveProject(s, p => ({
        ...p, characters: [...p.characters, { ...char, id: uuid() }]
      }))),
      updateCharacter: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, characters: p.characters.map(c => c.id === id ? { ...c, ...updates } : c)
      }))),
      deleteCharacter: (id) => set(s => updateActiveProject(s, p => ({
        ...p, characters: p.characters.filter(c => c.id !== id)
      }))),

      addLocation: (loc) => set(s => updateActiveProject(s, p => ({
        ...p, locations: [...p.locations, { ...loc, id: uuid() }]
      }))),
      updateLocation: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, locations: p.locations.map(l => l.id === id ? { ...l, ...updates } : l)
      }))),
      deleteLocation: (id) => set(s => updateActiveProject(s, p => ({
        ...p, locations: p.locations.filter(l => l.id !== id)
      }))),

      addProductionDay: (day) => set(s => updateActiveProject(s, p => ({
        ...p, productionDays: [...p.productionDays, { ...day, id: uuid() }]
      }))),
      updateProductionDay: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, productionDays: p.productionDays.map(d => d.id === id ? { ...d, ...updates } : d)
      }))),
      deleteProductionDay: (id) => set(s => updateActiveProject(s, p => ({
        ...p, productionDays: p.productionDays.filter(d => d.id !== id)
      }))),
      reorderDays: (days) => set(s => updateActiveProject(s, p => ({ ...p, productionDays: days }))),

      addShot: (shot) => set(s => updateActiveProject(s, p => ({
        ...p, shots: [...p.shots, { ...shot, id: uuid() }]
      }))),
      updateShot: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, shots: p.shots.map(sh => sh.id === id ? { ...sh, ...updates } : sh)
      }))),
      deleteShot: (id) => set(s => updateActiveProject(s, p => ({
        ...p, shots: p.shots.filter(sh => sh.id !== id)
      }))),

      addCrew: (member) => set(s => updateActiveProject(s, p => ({
        ...p, crew: [...p.crew, { ...member, id: uuid() }]
      }))),
      updateCrew: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, crew: p.crew.map(c => c.id === id ? { ...c, ...updates } : c)
      }))),
      deleteCrew: (id) => set(s => updateActiveProject(s, p => ({
        ...p, crew: p.crew.filter(c => c.id !== id)
      }))),

      createCallSheet: (sheet) => set(s => updateActiveProject(s, p => ({
        ...p, callSheets: [...p.callSheets, { ...sheet, id: uuid() }]
      }))),
      updateCallSheet: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p, callSheets: p.callSheets.map(cs => cs.id === id ? { ...cs, ...updates } : cs)
      }))),
      deleteCallSheet: (id) => set(s => updateActiveProject(s, p => ({
        ...p, callSheets: p.callSheets.filter(cs => cs.id !== id)
      }))),

      addCollaborator: (collab) => set(s => updateActiveProject(s, p => ({
        ...p,
        collaborators: [...(p.collaborators ?? []), { ...collab, id: uuid(), addedAt: new Date().toISOString() }],
        updatedAt: new Date().toISOString(),
      }))),
      updateCollaborator: (id, updates) => set(s => updateActiveProject(s, p => ({
        ...p,
        collaborators: (p.collaborators ?? []).map(c => c.id === id ? { ...c, ...updates } : c),
        updatedAt: new Date().toISOString(),
      }))),
      removeCollaborator: (id) => set(s => updateActiveProject(s, p => ({
        ...p,
        collaborators: (p.collaborators ?? []).filter(c => c.id !== id),
        updatedAt: new Date().toISOString(),
      }))),

      // Chat actions
      setChatUser: (user) => set({ chatCurrentUser: user }),

      sendChatMessage: (roomId, content) => {
        const s = get();
        if (!s.chatCurrentUser || !content.trim()) return;
        const msg: ChatMessage = {
          id: uuid(),
          roomId,
          senderId: s.chatCurrentUser.id,
          senderName: s.chatCurrentUser.name,
          senderDepartment: s.chatCurrentUser.department,
          content: content.trim(),
          timestamp: new Date().toISOString(),
          reactions: {},
        };
        if (socket.connected) {
          // Server will echo the message back to all clients including sender
          socket.emit('message', { roomId, message: msg });
        } else {
          // Offline fallback: update local state directly
          set(cur => ({
            chatMessages: {
              ...cur.chatMessages,
              [roomId]: [...(cur.chatMessages[roomId] ?? []), msg],
            },
          }));
        }
      },

      addReaction: (roomId, messageId, emoji) => {
        const s = get();
        if (!s.chatCurrentUser) return;
        if (socket.connected) {
          socket.emit('reaction', { roomId, messageId, emoji, userId: s.chatCurrentUser.id });
        } else {
          // Offline fallback
          const msgs = s.chatMessages[roomId] ?? [];
          const updated = msgs.map(m => {
            if (m.id !== messageId) return m;
            const existing = m.reactions?.[emoji] ?? [];
            const alreadyReacted = existing.includes(s.chatCurrentUser!.id);
            return {
              ...m,
              reactions: {
                ...m.reactions,
                [emoji]: alreadyReacted
                  ? existing.filter(id => id !== s.chatCurrentUser!.id)
                  : [...existing, s.chatCurrentUser!.id],
              },
            };
          });
          set({ chatMessages: { ...s.chatMessages, [roomId]: updated } });
        }
      },

      setActiveChatChannel: (id) => set({ activeChatChannelId: id, activeDmId: null }),

      startOrOpenDM: (otherUser) => set(s => {
        if (!s.chatCurrentUser) return s;
        const ids = [s.chatCurrentUser.id, otherUser.id].sort();
        const dmId = `dm:${ids[0]}:${ids[1]}`;
        const existing = s.chatDms.find(d => d.id === dmId);
        if (existing) {
          return { activeDmId: dmId, activeChatChannelId: '' };
        }
        const dm: ChatDM = {
          id: dmId,
          participantIds: ids,
          participantNames: [s.chatCurrentUser.name, otherUser.name],
        };
        return {
          chatDms: [...s.chatDms, dm],
          activeDmId: dmId,
          activeChatChannelId: '',
        };
      }),

      setActiveDm: (id) => set({ activeDmId: id, activeChatChannelId: '' }),

      // Socket receive actions
      receiveMessage: (message) => set(s => ({
        chatMessages: {
          ...s.chatMessages,
          [message.roomId]: [...(s.chatMessages[message.roomId] ?? []), message],
        },
      })),

      setRoomHistory: (roomId, messages) => set(s => ({
        chatMessages: { ...s.chatMessages, [roomId]: messages },
      })),

      receiveReactionUpdate: (roomId, messageId, reactions) => set(s => ({
        chatMessages: {
          ...s.chatMessages,
          [roomId]: (s.chatMessages[roomId] ?? []).map(m =>
            m.id === messageId ? { ...m, reactions } : m
          ),
        },
      })),

      setSocketConnected: (connected) => set({ socketConnected: connected }),

      setOnlineMembers: (members) => set({ onlineMembers: members }),
    }),
    { name: 'filmcraft-pro-v1' }
  )
);
