// Schedule data-source module. v1: local events stored in app state.
// Later: add a GoogleCalendarSource with the same interface (getEvents) and swap it in app.js.
export const LocalSource={name:'local',editable:true,async getEvents(state){return [...state.events].sort((a,b)=>a.time.localeCompare(b.time))}};
// export const GoogleCalendarSource={name:'google',editable:false,async getEvents(){ /* fetch today's events via Calendar API (OAuth) */ }};
export const activeSource=LocalSource;
