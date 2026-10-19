import { create } from 'zustand';
import { mockEvents } from '../data/mockEvents';
import { API_BASE_URL } from '../utils/apiConfig';
/*
|--------------------------------------------------------------------------
| Mapping Event dari API Laravel ke format Frontend
|--------------------------------------------------------------------------
*/
const mapEventFromApi = (item) => ({
    id: item.id ? item.id.toString() : null,

    judul: item.judul,
    penyelenggara: item.penyelenggara || '',

    tanggalMulai: item.tanggal_mulai,

    tanggalSelesai: item.tanggal_selesai,

    waktuMulai: item.waktu_mulai ?
        item.waktu_mulai.substring(0, 5) :
        '',

    waktuSelesai: item.waktu_selesai ?
        item.waktu_selesai.substring(0, 5) :
        '',

    timezone: 'Asia/Jakarta',

    lokasi: typeof item.lokasi === 'object' && item.lokasi !== null ?
        item.lokasi :
        {
            nama: item.lokasi || '',
            link: ''
        },

    pic: Array.isArray(item.pics) ?
        item.pics.map((p) => ({
            id: p.id ? p.id.toString() : null,
            nama: p.nama,
            email: p.email,
            noTelp: p.no_telp || ''
        })) :
        [],

    deskripsi: item.deskripsi || '',

    notulensi: item.notulensi || '',

    notulensiLink: item.notulensi_link || '',

    reminders: Array.isArray(item.reminders)
        ? item.reminders.map(r => typeof r === 'string' ? { type: r, enabled: true } : r)
        : [
            { type: 'H-7', enabled: true },
            { type: 'H-3', enabled: true },
            { type: 'H-1', enabled: true },
            { type: 'Hari H', enabled: true }
        ],

    status: item.status || 'new',

    priority: item.priority || 'standard',

    dibuatOleh: {
        id: 'u1',
        nama: item.dibuat_oleh || 'Admin Safety'
    },

    dibuatPada: item.created_at || new Date().toISOString(),

    diperbaruiOleh: {
        id: 'u1',
        nama: item.diperbarui_oleh || 'Admin Safety'
    },

    diperbaruiPada: item.updated_at || new Date().toISOString(),
});

/*
|--------------------------------------------------------------------------
| Data PIC awal
|--------------------------------------------------------------------------
*/
export const initialPics = [{
    id: 'p1',
    nama: 'Citra',
    email: 'citra@safety.local',
    noTelp: '08123456789',
    departemen: 'HSE / Safety Patrol',
    status: 'aktif'
},
{
    id: 'p2',
    nama: 'Andi',
    email: 'andi@safety.local',
    noTelp: '08111222333',
    departemen: 'HSE Manager',
    status: 'aktif'
},
{
    id: 'p3',
    nama: 'Budi',
    email: 'budi@safety.local',
    noTelp: '08999888777',
    departemen: 'Safety Inspector',
    status: 'aktif'
},
{
    id: 'p4',
    nama: 'Deni',
    email: 'deni@safety.local',
    noTelp: '081333444555',
    departemen: 'K3 Trainer',
    status: 'aktif'
},
];

const getDeletedEventIds = () => {
    try {
        return JSON.parse(localStorage.getItem('coemanagement_deleted_ids') || '[]');
    } catch (e) {
        return [];
    }
};

const recordDeletedEventId = (id) => {
    if (!id) return;
    const deletedIds = getDeletedEventIds();
    const idStr = id.toString();
    if (!deletedIds.includes(idStr)) {
        deletedIds.push(idStr);
        localStorage.setItem('coemanagement_deleted_ids', JSON.stringify(deletedIds));
    }
};

const getStoredEvents = () => {
    const deletedIds = getDeletedEventIds();
    const saved = localStorage.getItem('coemanagement_events');
    if (saved !== null) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed.filter(e => e.id && !deletedIds.includes(e.id.toString()));
            }
        } catch (e) {
            console.error('Error parsing stored events:', e);
        }
    }
    return mockEvents.filter(e => e.id && !deletedIds.includes(e.id.toString()));
};

const saveStoredEvents = (events) => {
    try {
        localStorage.setItem('coemanagement_events', JSON.stringify(events));
    } catch (e) {
        console.error('Error saving events to localStorage:', e);
    }
};

const getStoredPics = () => {
    try {
        const saved = localStorage.getItem('coemanagement_pics');
        if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error parsing stored pics:', e);
    }
    return initialPics;
};

const saveStoredPics = (pics) => {
    try {
        localStorage.setItem('coemanagement_pics', JSON.stringify(pics));
    } catch (e) {
        console.error('Error saving pics to localStorage:', e);
    }
};

/*
|--------------------------------------------------------------------------
| Zustand Store
|--------------------------------------------------------------------------
*/
export const useEventStore = create((set, get) => ({

    /*
    |--------------------------------------------------------------------------
    | Initial State
    |--------------------------------------------------------------------------
    */
    events: getStoredEvents(),

    pics: getStoredPics(),

    selectedEvent: null,

    isLoading: false,

    /*
    |--------------------------------------------------------------------------
    | FETCH EVENTS
    |--------------------------------------------------------------------------
    */
    fetchEvents: async () => {

        set({ isLoading: true });
        const deletedIds = getDeletedEventIds();

        try {

            const res = await fetch(`${API_BASE_URL}/events`);

            if (res.ok) {

                const data = await res.json();

                if (Array.isArray(data)) {

                    const mappedEvents = data
                        .map(mapEventFromApi)
                        .filter(e => e.id && !deletedIds.includes(e.id.toString()));

                    saveStoredEvents(mappedEvents);

                    set({
                        events: mappedEvents,
                        isLoading: false
                    });

                    return;
                }
            }

        } catch (err) {

            console.warn(
                'API Error, menggunakan data lokal persistent:',
                err
            );
        }

        set({
            events: getStoredEvents(),
            isLoading: false
        });
    },

    /*
    |--------------------------------------------------------------------------
    | FETCH PIC
    |--------------------------------------------------------------------------
    */
    fetchPics: async () => {

        try {

            const res = await fetch(`${API_BASE_URL}/pics`);

            if (res.ok) {

                const data = await res.json();

                if (Array.isArray(data)) {

                    const mapped = data.map((p) => ({

                        id: p.id ?
                            p.id.toString() :
                            null,

                        nama: p.nama,

                        email: p.email,

                        noTelp: p.no_telp || '',

                        departemen: p.departemen || 'General Safety',

                        status: p.status === 'Inactive' ?
                            'nonaktif' :
                            'aktif',

                    }));

                    saveStoredPics(mapped);
                    set({
                        pics: mapped
                    });
                }
            }

        } catch (err) {

            console.warn(
                'Fetch PIC API gagal:',
                err
            );
        }
    },

    /*
    |--------------------------------------------------------------------------
    | SELECT EVENT
    |--------------------------------------------------------------------------
    */
    setSelectedEvent: (event) => {

        set({
            selectedEvent: event
        });
    },

    /*
    |--------------------------------------------------------------------------
    | ADD PIC
    |--------------------------------------------------------------------------
    */
    addPic: async (picData) => {

        const payload = {

            nama: picData.nama,

            email: picData.email,

            no_telp: picData.noTelp || '',

            status: picData.status === 'nonaktif' ?
                'Inactive' :
                'Active',

        };

        try {

            const res = await fetch(
                `${API_BASE_URL}/pics`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },

                body: JSON.stringify(payload),
            }
            );

            if (res.ok) {

                const created = await res.json();

                const newPic = {

                    id: created.id ?
                        created.id.toString() :
                        `p_${Date.now()}`,

                    nama: created.nama,

                    email: created.email,

                    noTelp: created.no_telp || '',

                    departemen: picData.departemen || 'General Safety',

                    status: picData.status || 'aktif',
                };

                const updatedList = [newPic, ...get().pics];
                saveStoredPics(updatedList);
                set({ pics: updatedList });
                return;
            }

        } catch (err) {

            console.error(
                'Failed to create PIC on API:',
                err
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback Lokal
        |--------------------------------------------------------------------------
        */
        const localPic = {

            id: `p_${Date.now()}`,

            nama: picData.nama,

            email: picData.email,

            noTelp: picData.noTelp || '',

            departemen: picData.departemen || 'General Safety',

            status: picData.status || 'aktif',
        };

        const updatedList = [localPic, ...get().pics];
        saveStoredPics(updatedList);
        set({ pics: updatedList });
    },

    /*
    |--------------------------------------------------------------------------
    | UPDATE PIC
    |--------------------------------------------------------------------------
    */
    updatePic: async (id, updatedFields) => {

        const payload = {

            nama: updatedFields.nama,

            email: updatedFields.email,

            no_telp: updatedFields.noTelp,

            status: updatedFields.status === 'nonaktif' ?
                'Inactive' :
                'Active',
        };

        try {

            const res = await fetch(
                `${API_BASE_URL}/pics/${id}`, {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },

                body: JSON.stringify(payload),
            }
            );

            if (!res.ok) {

                console.error(
                    'Update PIC gagal:',
                    res.status
                );
            }

        } catch (err) {

            console.error(
                'Failed to update PIC on API:',
                err
            );
        }

        set((state) => {
            const updated = state.pics.map((pic) => {
                if (pic.id === id) {
                    return {
                        ...pic,
                        ...updatedFields
                    };
                }
                return pic;
            });
            saveStoredPics(updated);
            return { pics: updated };
        });
    },

    /*
    |--------------------------------------------------------------------------
    | DELETE PIC
    |--------------------------------------------------------------------------
    */
    deletePic: async (id) => {

        try {

            const res = await fetch(
                `${API_BASE_URL}/pics/${id}`, {
                method: 'DELETE'
            }
            );

            if (!res.ok) {

                console.error(
                    'Delete PIC gagal:',
                    res.status
                );
            }

        } catch (err) {

            console.error(
                'Failed to delete PIC on API:',
                err
            );
        }

        set((state) => {
            const updated = state.pics.filter((pic) => pic.id !== id);
            saveStoredPics(updated);
            return { pics: updated };
        });
    },

    /*
    |--------------------------------------------------------------------------
    | ADD EVENT
    |--------------------------------------------------------------------------
    */
    addEvent: async (eventData) => {

        const loggedUser = JSON.parse(
            localStorage.getItem('user') || '{}'
        );

        const currentUserName =
            loggedUser.name || 'Admin Safety';

        const picList =
            Array.isArray(eventData.pic) ?
                eventData.pic :
                [];

        const picIds = picList
            .map(p => p.id)
            .filter(id => id && !isNaN(Number(id)))
            .map(Number);

        const firstPic = picList[0] || null;

        const payload = {

            judul: eventData.judul,
            penyelenggara: eventData.penyelenggara || null,

            tanggal_mulai: eventData.tanggalMulai,

            tanggal_selesai: eventData.tanggalSelesai,

            waktu_mulai: eventData.waktuMulai ? eventData.waktuMulai : null,

            waktu_selesai: eventData.waktuSelesai ? eventData.waktuSelesai : null,

            lokasi: typeof eventData.lokasi === 'object' ?
                (
                    eventData.lokasi && eventData.lokasi.nama && eventData.lokasi.nama.trim() ?
                        eventData.lokasi.nama.trim() :
                        null
                ) :
                (eventData.lokasi && eventData.lokasi.trim() ? eventData.lokasi.trim() : null),

            deskripsi: eventData.deskripsi,

            notulensi: eventData.notulensi || '',

            notulensi_link: eventData.notulensiLink || '',

            status: eventData.status || 'new',

            priority: eventData.priority || 'standard',

            dibuat_oleh: currentUserName,

            pic_nama: firstPic ?
                firstPic.nama :
                '',

            pic_email: firstPic ?
                firstPic.email :
                '',

            pic_no_telp: firstPic ?
                firstPic.noTelp :
                '',

            pic_ids: picIds,

            pics: picList,

            reminders: eventData.reminders || [
                { type: 'H-7', enabled: true },
                { type: 'H-3', enabled: true },
                { type: 'H-1', enabled: true },
                { type: 'Hari H', enabled: true }
            ],
        };

        try {

            const res = await fetch(
                `${API_BASE_URL}/events`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },

                body: JSON.stringify(payload),
            }
            );

            if (res.ok) {
                const created = await res.json();
                const mapped = mapEventFromApi(created);

                set((state) => {
                    const updatedList = [mapped, ...state.events];
                    saveStoredEvents(updatedList);
                    return { events: updatedList };
                });

                return { success: true, synced: true, event: mapped };
            } else {
                const errJson = await res.json().catch(() => null);
                console.warn('API error when adding event:', res.status, errJson);
            }
        } catch (err) {
            console.error('Failed to create event on API:', err);
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback Lokal (Offline / Tidak terhubung ke database)
        |--------------------------------------------------------------------------
        */
        const newEvent = {
            id: Date.now().toString(),
            timezone: 'Asia/Jakarta',
            status: 'new',
            priority: eventData.priority || 'standard',
            dibuatOleh: {
                id: 'u1',
                nama: currentUserName
            },
            dibuatPada: new Date().toISOString(),
            diperbaruiOleh: {
                id: 'u1',
                nama: currentUserName
            },
            diperbaruiPada: new Date().toISOString(),
            ...eventData
        };

        set((state) => {
            const updatedList = [newEvent, ...state.events];
            saveStoredEvents(updatedList);
            return { events: updatedList };
        });

        return {
            success: true,
            synced: false,
            warning: 'Kegiatan tersimpan secara lokal, namun belum masuk ke database pusat. Pastikan backend server terhubung.',
            event: newEvent
        };
    },

    /*
    |--------------------------------------------------------------------------
    | UPDATE EVENT
    |--------------------------------------------------------------------------
    */
    updateEvent: async (id, updatedFields) => {

        const loggedUser = JSON.parse(
            localStorage.getItem('user') || '{}'
        );

        const currentUserName =
            loggedUser.name || 'Admin Safety';

        const currentEvent = get().events.find(
            (e) => e.id && e.id.toString() === id.toString()
        ) || {};

        const mergedEvent = {
            ...currentEvent,
            ...updatedFields,
        };

        const picList =
            Array.isArray(mergedEvent.pic) ?
                mergedEvent.pic :
                [];

        const picIds = picList
            .map(p => p.id)
            .filter(id => id && !isNaN(Number(id)))
            .map(Number);

        const firstPic = picList[0] || null;

        const payload = {

            judul: mergedEvent.judul,
            penyelenggara: mergedEvent.penyelenggara !== undefined ? (mergedEvent.penyelenggara || null) : (currentEvent.penyelenggara || null),

            tanggal_mulai: mergedEvent.tanggalMulai,

            tanggal_selesai: mergedEvent.tanggalSelesai,

            waktu_mulai: mergedEvent.waktuMulai ? mergedEvent.waktuMulai : null,

            waktu_selesai: mergedEvent.waktuSelesai ? mergedEvent.waktuSelesai : null,

            lokasi: typeof mergedEvent.lokasi === 'object' ?
                (
                    mergedEvent.lokasi && mergedEvent.lokasi.nama && mergedEvent.lokasi.nama.trim() ?
                        mergedEvent.lokasi.nama.trim() :
                        null
                ) :
                (mergedEvent.lokasi && mergedEvent.lokasi.trim() ? mergedEvent.lokasi.trim() : null),

            deskripsi: mergedEvent.deskripsi,

            notulensi: mergedEvent.notulensi || '',

            notulensi_link: mergedEvent.notulensiLink || '',

            status: updatedFields.status !== undefined ?
                updatedFields.status :
                (currentEvent.status || 'reschedule'),

            priority: mergedEvent.priority || 'standard',

            diperbarui_oleh: currentUserName,

            pic_nama: firstPic ? firstPic.nama || '' : '',

            pic_email: firstPic ? firstPic.email || '' : '',

            pic_no_telp: firstPic ? firstPic.noTelp || '' : '',

            pic_ids: picIds,
            pics: picList,
            reminders: mergedEvent.reminders !== undefined
                ? mergedEvent.reminders
                : (updatedFields.reminders || [
                    { type: 'H-7', enabled: true },
                    { type: 'H-3', enabled: true },
                    { type: 'H-1', enabled: true },
                    { type: 'Hari H', enabled: true }
                ]),
        };

        try {

            const res = await fetch(
                `${API_BASE_URL}/events/${id}`, {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },

                body: JSON.stringify(payload),
            }
            );

            if (!res.ok) {

                console.error(
                    'Update event gagal:',
                    res.status
                );
            }

        } catch (err) {

            console.error(
                'Failed to update event on API:',
                err
            );
        }

        set((state) => {
            const updatedList = state.events.map(
                (event) => {
                    if (event.id === id) {
                        return {
                            ...event,
                            ...updatedFields,
                            status: updatedFields.status !== undefined ?
                                updatedFields.status :
                                event.status,
                            diperbaruiPada: new Date().toISOString(),
                        };
                    }
                    return event;
                }
            );
            saveStoredEvents(updatedList);

            return {
                events: updatedList,
                selectedEvent: state.selectedEvent && state.selectedEvent.id === id
                    ? { ...state.selectedEvent, ...updatedFields }
                    : state.selectedEvent
            };
        });
    },

    /*
    |--------------------------------------------------------------------------
    | SAVE NOTULENSI
    |--------------------------------------------------------------------------
    */
    saveNotulensi: async (id, notulensi, notulensiLink = '') => {
        return get().updateEvent(id, { notulensi, notulensiLink });
    },

    /*
    |--------------------------------------------------------------------------
    | DELETE EVENT
    |--------------------------------------------------------------------------
    */
    deleteEvent: async (id) => {

        if (id) {
            recordDeletedEventId(id);
        }

        try {

            const res = await fetch(
                `${API_BASE_URL}/events/${id}`, {
                method: 'DELETE'
            }
            );

            if (!res.ok) {

                console.error(
                    'Delete event gagal:',
                    res.status
                );
            }

        } catch (err) {

            console.error(
                'Failed to delete event on API:',
                err
            );
        }

        set((state) => {
            const updatedEvents = state.events.filter(
                (event) => event.id && event.id.toString() !== id.toString()
            );
            saveStoredEvents(updatedEvents);
            return {
                events: updatedEvents,
                selectedEvent: state.selectedEvent && state.selectedEvent.id && state.selectedEvent.id.toString() === id.toString() ? null : state.selectedEvent
            };
        });
    },

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS EVENT
    |--------------------------------------------------------------------------
    */
    markStatus: async (id, newStatus) => {

        const loggedUser = JSON.parse(
            localStorage.getItem('user') || '{}'
        );

        const currentUserName =
            loggedUser.name || 'Admin Safety';

        try {

            const res = await fetch(
                `${API_BASE_URL}/events/${id}`, {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },

                body: JSON.stringify({

                    status: newStatus,

                    diperbarui_oleh: currentUserName
                }),
            }
            );

            if (res.ok) {

                const updated =
                    await res.json();

                const mapped =
                    mapEventFromApi(updated);

                set((state) => ({

                    events: state.events.map(
                        (e) =>
                            e.id &&
                                e.id.toString() ===
                                id.toString()

                                ?
                                mapped

                                :
                                e
                    ),

                    selectedEvent: state.selectedEvent &&
                        state.selectedEvent.id &&
                        state.selectedEvent.id.toString() ===
                        id.toString()

                        ?
                        mapped

                        : state.selectedEvent
                }));

                return mapped;
            }

        } catch (err) {

            console.error(
                'Failed to update status on API:',
                err
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback Lokal
        |--------------------------------------------------------------------------
        */
        set((state) => ({

            events: state.events.map(
                (event) => {

                    if (
                        event.id &&
                        event.id.toString() ===
                        id.toString()
                    ) {

                        return {

                            ...event,

                            status: newStatus,

                            diperbaruiOleh: {
                                id: 'u1',
                                nama: currentUserName
                            },

                            diperbaruiPada: new Date().toISOString(),
                        };
                    }

                    return event;
                }
            )
        }));
    }

}));