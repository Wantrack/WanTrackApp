import React from 'react';
import NotificationAlert from "react-notification-alert";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import useServerPagination from '../components/Pagination/useServerPagination';
import constants from '../util/constans';
import { axios } from '../config/https';
import SocketService from "../socket";
import Chat from './Chat';
import { getCompanyId, getUserInfo } from '../util/localStorageInfo';

const FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Activos' },
    { id: 'unread', label: 'No leídas' },
    { id: 'human', label: 'Humanas' },
    { id: 'bot', label: 'Bot' },
];

function isAdminUser(user) {
    return Number(user?.idrol) === 1 || Number(user?.idroles) === 1;
}

function statusLabel(status) {
    if (status === 'human') return 'Humano';
    if (status === 'waiting_human') return 'En espera';
    if (status === 'closed') return 'Cerrado';
    return 'Bot';
}

function isScopedId(value) {
    return /\./.test(String(value || ''));
}

function chatTitle(chat) {
    const name = String(chat?.name || '').trim();
    const phone = String(chat?.phone || '').trim();
    if (name && name !== phone) return name;
    if (isScopedId(phone)) return 'Contacto WhatsApp';
    return phone || 'Conversación';
}

function chatSubtitle(chat) {
    const name = String(chat?.name || '').trim();
    const phone = String(chat?.phone || '').trim();
    if (name && name !== phone) return phone;
    return isScopedId(phone) ? phone : '';
}

function relativeTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d`;
    return date.toLocaleDateString();
}

function lineLabel(line, includeCompany = false) {
    const name = String(line?.displayname || line?.lineName || line?.accountName || '').trim();
    const ownLine = line?.linePhone ?? line?.accountPhone;
    const phone = String(
        ownLine !== undefined && ownLine !== null
            ? ownLine
            : (line?.lineName !== undefined || line?.accountName !== undefined ? '' : line?.phone)
    ).trim();
    const base = name && phone && name !== phone
        ? `${name} · ${phone}`
        : (name || phone || String(line?.phoneNumberId || 'Número'));
    const company = String(line?.companyName || '').trim();
    if (includeCompany && company && company !== base) return `${company} · ${base}`;
    return base;
}

function companyLabel(company) {
    const name = String(company?.name || '').trim();
    return name || `Empresa ${company?.idcompany}`;
}

function selectedLineParam(phoneLines, selectedLineIds) {
    if (!Array.isArray(phoneLines) || phoneLines.length < 2 || !Array.isArray(selectedLineIds)) return null;
    const allIds = phoneLines.map((line) => String(line.phoneNumberId));
    const selected = selectedLineIds.map(String);
    const allSelected = allIds.length === selected.length && allIds.every((id) => selected.includes(id));
    if (allSelected) return null;
    return selected.join(',');
}

const LIST_MIN = 300;
const LIST_DEFAULT = 380;
const THREAD_MIN = 520;

function readListWidth() {
    const stored = Number(localStorage.getItem('wantrack.inboxListWidth'));
    return Number.isFinite(stored) && stored >= LIST_MIN ? stored : LIST_DEFAULT;
}

function clampListWidth(preferred, shellWidth) {
    const max = Math.max(LIST_MIN, shellWidth - THREAD_MIN);
    return Math.min(Math.max(preferred, LIST_MIN), max);
}

function selectionSummary(selectedIds, items, getId, getLabel, labels) {
    if (!Array.isArray(items) || items.length === 0) return labels.all;
    if (!Array.isArray(selectedIds) || selectedIds.length === items.length) return labels.all;
    if (selectedIds.length === 0) return labels.none;
    if (selectedIds.length === 1) {
        const match = items.find((item) => String(getId(item)) === String(selectedIds[0]));
        return match ? getLabel(match) : `1 ${labels.one}`;
    }
    return `${selectedIds.length} ${labels.many}`;
}

function selectedCompanyParam(companies, selectedCompanyIds) {
    if (!Array.isArray(companies) || companies.length < 2 || !Array.isArray(selectedCompanyIds)) return null;
    const allIds = companies.map((company) => String(company.idcompany));
    const selected = selectedCompanyIds.map(String);
    const allSelected = allIds.length === selected.length && allIds.every((id) => selected.includes(id));
    if (allSelected) return null;
    return selected.join(',');
}

function Chats() {
    const [searchValue, setSearchValue] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const isAdmin = isAdminUser(getUserInfo());
    const [assignmentEnabled, setAssignmentEnabled] = React.useState(false);
    const [filter, setFilter] = React.useState('all');
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [selected, setSelected] = React.useState(null);
    const [activeAssignments, setActiveAssignments] = React.useState([]);
    const [assignmentsOpen, setAssignmentsOpen] = React.useState(false);
    const [assignmentsLoading, setAssignmentsLoading] = React.useState(false);
    const [phoneLines, setPhoneLines] = React.useState([]);
    const [selectedLineIds, setSelectedLineIds] = React.useState(null);
    const [companies, setCompanies] = React.useState([]);
    const [selectedCompanyIds, setSelectedCompanyIds] = React.useState(null);
    const [companyQuery, setCompanyQuery] = React.useState('');
    const [filtersOpen, setFiltersOpen] = React.useState(false);
    const [companiesReady, setCompaniesReady] = React.useState(!isAdmin);
    const shellRef = React.useRef(null);
    const preferredListWidthRef = React.useRef(readListWidth());
    const [listWidth, setListWidth] = React.useState(preferredListWidthRef.current);
    const notificationAlertRef = React.useRef(null);
    const filterInitialized = React.useRef(isAdmin);

    const sendNotification = React.useCallback((message, type = 'success') => {
        notificationAlertRef.current?.notificationAlert({
            place: 'tr',
            message: <div><div>{message}</div></div>,
            type,
            icon: "tim-icons icon-bell-55",
            autoDismiss: 6,
        });
    }, []);

    const lineParam = React.useMemo(
        () => selectedLineParam(phoneLines, selectedLineIds),
        [phoneLines, selectedLineIds]
    );

    const companyParam = React.useMemo(
        () => selectedCompanyParam(companies, selectedCompanyIds),
        [companies, selectedCompanyIds]
    );
    const lineStorageKey = isAdmin
        ? `wantrack.chatLines.admin.${companyParam ?? 'all'}`
        : `wantrack.chatLines.${getCompanyId() || '0'}`;

    const loadActiveAssignments = React.useCallback(async () => {
        setAssignmentsLoading(true);
        try {
            const params = new URLSearchParams();
            if (companyParam !== null) params.set('companyIds', companyParam);
            if (lineParam !== null) params.set('phoneNumberIds', lineParam);
            const query = params.toString();
            const result = await axios.get(`${constants.apiurl}/api/chatassignments/active${query ? `?${query}` : ''}`);
            setActiveAssignments(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            sendNotification('No fue posible cargar las asignaciones activas.', 'danger');
        } finally {
            setAssignmentsLoading(false);
        }
    }, [companyParam, lineParam, sendNotification]);

    React.useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchValue.trim()), 350);
        return () => clearTimeout(timeout);
    }, [searchValue]);

    React.useEffect(() => {
        if (isAdmin) {
            setAssignmentEnabled(false);
            return undefined;
        }
        const companyId = getCompanyId();
        if (!companyId) {
            setAssignmentEnabled(false);
            return undefined;
        }
        let cancelled = false;
        axios.get(`${constants.apiurl}/api/company/${companyId}`).then((result) => {
            if (cancelled) return;
            const enabled = Number(result.data?.multiagent) === 1;
            setAssignmentEnabled(enabled);
            if (!filterInitialized.current) {
                filterInitialized.current = true;
                setFilter(enabled ? 'active' : 'all');
            }
        }).catch(() => {
            if (!cancelled) {
                setAssignmentEnabled(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [isAdmin]);

    React.useEffect(() => {
        if (!isAdmin) return undefined;
        let cancelled = false;
        axios.get(`${constants.apiurl}/api/chats/companies`).then((result) => {
            if (cancelled) return;
            const rows = (Array.isArray(result.data) ? result.data : []).filter((company) => company?.idcompany);
            setCompanies(rows);
            if (rows.length < 2) {
                setSelectedCompanyIds(null);
                return;
            }
            const available = new Set(rows.map((company) => String(company.idcompany)));
            let stored = null;
            try {
                stored = JSON.parse(sessionStorage.getItem('wantrack.chatCompanies') || 'null');
            } catch (error) {
                stored = null;
            }
            if (Array.isArray(stored)) {
                setSelectedCompanyIds(stored.map(String).filter((id) => available.has(id)));
                return;
            }
            setSelectedCompanyIds(rows.map((company) => String(company.idcompany)));
        }).catch(() => {
            if (!cancelled) {
                setCompanies([]);
                setSelectedCompanyIds(null);
            }
        }).finally(() => {
            if (!cancelled) setCompaniesReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [isAdmin]);

    React.useEffect(() => {
        if (isAdmin && !companiesReady) return undefined;
        const companyId = getCompanyId();
        if (!isAdmin && !companyId) {
            setPhoneLines([]);
            setSelectedLineIds(null);
            return undefined;
        }
        let cancelled = false;
        const params = new URLSearchParams();
        if (isAdmin && companyParam !== null) params.set('companyIds', companyParam);
        const query = params.toString();
        axios.get(`${constants.apiurl}/api/chats/lines${query ? `?${query}` : ''}`).then((result) => {
            if (cancelled) return;
            const lines = (Array.isArray(result.data) ? result.data : []).filter((line) => line?.phoneNumberId);
            setPhoneLines(lines);
            if (lines.length < 2) {
                setSelectedLineIds(null);
                return;
            }
            const available = new Set(lines.map((line) => String(line.phoneNumberId)));
            let stored = null;
            try {
                stored = JSON.parse(sessionStorage.getItem(lineStorageKey) || 'null');
            } catch (error) {
                stored = null;
            }
            if (Array.isArray(stored)) {
                const next = stored.map(String).filter((id) => available.has(id));
                setSelectedLineIds(stored.length > 0 && next.length === 0 ? lines.map((line) => String(line.phoneNumberId)) : next);
                return;
            }
            setSelectedLineIds(lines.map((line) => String(line.phoneNumberId)));
        }).catch(() => {
            if (!cancelled) {
                setPhoneLines([]);
                setSelectedLineIds(null);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [isAdmin, companiesReady, companyParam, lineStorageKey]);

    const buildUrl = React.useCallback(({ page, pageSize }) => {
        const params = new URLSearchParams({
            page,
            pageSize,
        });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filter) params.set('filter', filter);
        if (isAdmin) params.set('allCompanies', 'true');
        if (companyParam !== null) params.set('companyIds', companyParam);
        if (lineParam !== null) params.set('phoneNumberIds', lineParam);
        return `${constants.apiurl}/api/chats?${params.toString()}`;
    }, [debouncedSearch, filter, refreshKey, isAdmin, companyParam, lineParam]);

    const pagination = useServerPagination(buildUrl, [debouncedSearch, filter, refreshKey, companyParam, lineParam], 40);

    React.useEffect(() => {
        if (!isAdmin && !assignmentEnabled) {
            setActiveAssignments([]);
            return;
        }
        loadActiveAssignments();
    }, [loadActiveAssignments, refreshKey, isAdmin, assignmentEnabled]);

    const upsertConversation = React.useCallback((conversation) => {
        if (!conversation?.idconversation && !conversation?.phone) return;
        setSelected((current) => {
            if (!current) return current;
            const same = (conversation.idconversation && current.idconversation === conversation.idconversation)
                || (conversation.phone === current.phone && conversation.phoneNumberId === current.phoneNumberId);
            return same ? { ...current, ...conversation } : current;
        });
    }, []);

    const closeAssignment = async (assignment) => {
        if(!window.confirm(`¿Liberar el chat ${assignment.phone} asignado a ${assignment.userName}?`)) return;
        setAssignmentsLoading(true);
        try {
            await axios.post(`${constants.apiurl}/api/chatassignments/${assignment.idchatAssignments}/close`);
            sendNotification('La asignación fue cerrada y el bot puede responder nuevamente.');
            setRefreshKey(value => value + 1);
        } catch (error) {
            sendNotification(error.response?.data?.error || 'No fue posible cerrar la asignación.', 'danger');
            setAssignmentsLoading(false);
        }
    };

    const closeAllAssignments = async () => {
        if(activeAssignments.length === 0) return;
        if(!window.confirm(`¿Liberar las ${activeAssignments.length} asignaciones activas? El historial no se eliminará.`)) return;
        setAssignmentsLoading(true);
        try {
            const body = {};
            if (companyParam !== null) body.companyIds = companyParam;
            if (lineParam !== null) body.phoneNumberIds = lineParam;
            const result = await axios.post(`${constants.apiurl}/api/chatassignments/close-all`, body);
            sendNotification(`Se cerraron ${Number(result.data?.closed || 0)} asignaciones.`);
            setRefreshKey(value => value + 1);
        } catch (error) {
            sendNotification(error.response?.data?.error || 'No fue posible cerrar las asignaciones.', 'danger');
            setAssignmentsLoading(false);
        }
    };

    React.useEffect(() => {
        const socket = new SocketService();
        socket.getSocket().on('notificationrefresh', () => {
            setRefreshKey(value => value + 1);
        });
        socket.getSocket().on('conversation', (payload) => {
            if (payload?.conversation) {
                upsertConversation(payload.conversation);
            }
            if (payload?.type === 'message' || payload?.type === 'status') {
                setRefreshKey(value => value + 1);
            }
        });
        return () => {
            socket.disconnect();
        };
    }, [upsertConversation]);

    function rememberLines(next) {
        sessionStorage.setItem(lineStorageKey, JSON.stringify(next));
        setSelectedLineIds(next);
    }

    function toggleLine(phoneNumberId) {
        const id = String(phoneNumberId);
        const current = selectedLineIds || phoneLines.map((line) => String(line.phoneNumberId));
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        rememberLines(next);
    }

    function toggleAllLines() {
        const allIds = phoneLines.map((line) => String(line.phoneNumberId));
        const allSelected = Array.isArray(selectedLineIds) && allIds.every((id) => selectedLineIds.includes(id));
        rememberLines(allSelected ? [] : allIds);
    }

    function rememberCompanies(next) {
        sessionStorage.setItem('wantrack.chatCompanies', JSON.stringify(next));
        setSelectedCompanyIds(next);
    }

    function toggleCompany(companyId) {
        const id = String(companyId);
        const current = selectedCompanyIds || companies.map((company) => String(company.idcompany));
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        rememberCompanies(next);
    }

    function toggleAllCompanies() {
        const allIds = companies.map((company) => String(company.idcompany));
        const allSelected = Array.isArray(selectedCompanyIds) && allIds.every((id) => selectedCompanyIds.includes(id));
        rememberCompanies(allSelected ? [] : allIds);
    }

    function fitListWidth(preferred = preferredListWidthRef.current) {
        const shellWidth = shellRef.current?.getBoundingClientRect().width || preferred + THREAD_MIN;
        setListWidth(clampListWidth(preferred, shellWidth));
    }

    React.useEffect(() => {
        fitListWidth();
        const onResize = () => fitListWidth();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            document.body.classList.remove('wa-inbox-resizing');
        };
    }, []);

    function startListResize(event) {
        if (event.button !== 0) return;
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = preferredListWidthRef.current;
        const onMove = (moveEvent) => {
            const shellWidth = shellRef.current?.getBoundingClientRect().width || startWidth + THREAD_MIN;
            const next = clampListWidth(startWidth + (moveEvent.clientX - startX), shellWidth);
            preferredListWidthRef.current = next;
            setListWidth(next);
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            document.body.classList.remove('wa-inbox-resizing');
            localStorage.setItem('wantrack.inboxListWidth', String(Math.round(preferredListWidthRef.current)));
        };
        document.body.classList.add('wa-inbox-resizing');
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }

    function openConversation(chat) {
        localStorage.setItem('currentPhone', chat.phone);
        localStorage.setItem('currentName', chat.name || '');
        localStorage.setItem('currentphoneNumberID', chat.phoneNumberId);
        setSelected(chat);
    }

    React.useEffect(() => {
        if (!selected || phoneLines.length < 2 || !Array.isArray(selectedLineIds)) return;
        if (!selectedLineIds.map(String).includes(String(selected.phoneNumberId))) {
            setSelected(null);
        }
    }, [selected, selectedLineIds, phoneLines.length]);

    React.useEffect(() => {
        if (!isAdmin || !selected || companies.length < 2 || !Array.isArray(selectedCompanyIds)) return;
        if (selected.idcompany === undefined || selected.idcompany === null) return;
        if (!selectedCompanyIds.map(String).includes(String(selected.idcompany))) {
            setSelected(null);
        }
    }, [isAdmin, selected, selectedCompanyIds, companies.length]);

    const unreadTotal = pagination.paginatedItems.reduce((sum, chat) => sum + Number(chat.unread_count || 0), 0);
    const allLinesSelected = phoneLines.length > 1 && Array.isArray(selectedLineIds)
        && phoneLines.every((line) => selectedLineIds.includes(String(line.phoneNumberId)));
    const noLineSelected = phoneLines.length > 1 && Array.isArray(selectedLineIds) && selectedLineIds.length === 0;
    const allCompaniesSelected = companies.length > 1 && Array.isArray(selectedCompanyIds)
        && companies.every((company) => selectedCompanyIds.includes(String(company.idcompany)));
    const noCompanySelected = isAdmin && companies.length > 1 && Array.isArray(selectedCompanyIds) && selectedCompanyIds.length === 0;
    const linesSpanCompanies = new Set(phoneLines.map((line) => String(line.idCompany || line.companyName || ''))).size > 1;
    const visibleCompanies = companies.filter((company) => companyLabel(company).toLowerCase().includes(companyQuery.trim().toLowerCase()));
    const companySummary = selectionSummary(selectedCompanyIds, companies, (company) => company.idcompany, companyLabel, { all: 'Todas', none: 'Ninguna', one: 'empresa', many: 'empresas' });
    const lineSummary = selectionSummary(selectedLineIds, phoneLines, (line) => line.phoneNumberId, (line) => lineLabel(line, linesSpanCompanies), { all: 'Todos', none: 'Ninguno', one: 'número', many: 'números' });
    const activeStatus = FILTERS.find((item) => item.id === filter)?.label || 'Todos';
    const filterParts = [];
    if (searchValue.trim()) filterParts.push(`"${searchValue.trim()}"`);
    if (companies.length > 1 && companySummary !== 'Todas') filterParts.push(companySummary);
    if (phoneLines.length > 1 && lineSummary !== 'Todos') filterParts.push(lineSummary);
    if (filter !== 'all') filterParts.push(activeStatus);
    const filterSummary = filterParts.length > 0 ? filterParts.join(' · ') : 'Todos';

    return <div className="content wa-inbox-page">
        <NotificationAlert ref={notificationAlertRef} />
        <Loader active={assignmentsLoading} />
        <div className={`wa-inbox-shell ${selected ? 'has-thread' : ''}`} ref={shellRef}>
            <aside className="wa-inbox-list" style={{ width: listWidth }}>
                <div className="wa-inbox-toolbar">
                    <div>
                        <h5>Bandeja</h5>
                        <small>{unreadTotal > 0 ? `${unreadTotal} sin leer` : 'Al día'}</small>
                    </div>
                    {(isAdmin || assignmentEnabled) ? (
                        <button className="wa-inbox-assign" type="button" onClick={() => setAssignmentsOpen((open) => !open)}>
                            Asignadas {activeAssignments.length}
                        </button>
                    ) : null}
                </div>
                {assignmentsOpen && (isAdmin || assignmentEnabled) && (
                    <div className="wa-assign-panel">
                        <div className="wa-assign-panel-head">
                            <span>Atención humana activa</span>
                            <button type="button" disabled={activeAssignments.length === 0} onClick={closeAllAssignments}>Liberar todas</button>
                        </div>
                        {activeAssignments.length === 0 ? <p>No hay asignaciones.</p> : activeAssignments.map((assignment) => (
                            <div key={assignment.idchatAssignments} className="wa-assign-row">
                                <div>
                                    <strong>{assignment.phone}</strong>
                                    <small>{assignment.userName} · {assignment.departmentName || 'General'}{isAdmin && companies.length > 1 && assignment.companyName ? ` · ${assignment.companyName}` : ''}{phoneLines.length > 1 ? ` · ${lineLabel(assignment)}` : ''}</small>
                                </div>
                                <button type="button" onClick={() => closeAssignment(assignment)}>Liberar</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className={`wa-inbox-lines ${filtersOpen ? 'open' : ''}`}>
                    <div className="wa-inbox-lines-head">
                        <button type="button" className="wa-inbox-lines-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
                            <i className={`fa-solid ${filtersOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`} />
                            <strong>Filtros</strong>
                            {!filtersOpen && <em className={filterSummary === 'Todos' ? '' : 'narrow'}>{filterSummary}</em>}
                        </button>
                    </div>
                    {filtersOpen && (
                        <div className="wa-inbox-filter-body">
                            <div className="wa-inbox-search">
                                <i className="fa fa-search" />
                                <input
                                    type="text"
                                    placeholder="Buscar nombre o teléfono"
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                />
                            </div>
                            <div className="wa-inbox-filters">
                                {FILTERS.map((item) => (
                                    <button key={item.id || 'all'} type="button" className={filter === item.id ? 'active' : ''} onClick={() => setFilter(item.id)}>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            {companies.length > 1 && (
                                <div className="wa-inbox-filter-block">
                                    <div className="wa-inbox-lines-head">
                                        <span>Empresas</span>
                                        <em className={companySummary === 'Todas' ? '' : 'narrow'}>{companySummary}</em>
                                        <button type="button" onClick={toggleAllCompanies}>{allCompaniesSelected ? 'Ninguno' : 'Todos'}</button>
                                    </div>
                                    {companies.length > 6 && (
                                        <input
                                            className="wa-inbox-lines-search"
                                            type="text"
                                            placeholder="Buscar empresa"
                                            value={companyQuery}
                                            onChange={(event) => setCompanyQuery(event.target.value)}
                                        />
                                    )}
                                    <div className="wa-inbox-lines-options">
                                        {visibleCompanies.map((company) => {
                                            const id = String(company.idcompany);
                                            const checked = Array.isArray(selectedCompanyIds) && selectedCompanyIds.includes(id);
                                            return (
                                                <label key={id}>
                                                    <input type="checkbox" checked={checked} onChange={() => toggleCompany(id)} />
                                                    <span>{companyLabel(company)}</span>
                                                </label>
                                            );
                                        })}
                                        {visibleCompanies.length === 0 ? <p className="wa-inbox-lines-empty">Ninguna empresa coincide.</p> : null}
                                    </div>
                                </div>
                            )}
                            {phoneLines.length > 1 && (
                                <div className="wa-inbox-filter-block">
                                    <div className="wa-inbox-lines-head">
                                        <span>Números</span>
                                        <em className={lineSummary === 'Todos' ? '' : 'narrow'}>{lineSummary}</em>
                                        <button type="button" onClick={toggleAllLines}>{allLinesSelected ? 'Ninguno' : 'Todos'}</button>
                                    </div>
                                    <div className="wa-inbox-lines-options">
                                        {phoneLines.map((line) => {
                                            const id = String(line.phoneNumberId);
                                            const checked = Array.isArray(selectedLineIds) && selectedLineIds.includes(id);
                                            return (
                                                <label key={id}>
                                                    <input type="checkbox" checked={checked} onChange={() => toggleLine(id)} />
                                                    <span>{lineLabel(line, linesSpanCompanies)}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="wa-inbox-items">
                    {pagination.paginatedItems.length === 0 && !pagination.loading ? (
                        <div className="wa-inbox-empty">{noCompanySelected ? 'Selecciona al menos una empresa.' : noLineSelected ? 'Selecciona al menos un número para ver sus conversaciones.' : 'No hay conversaciones en este filtro.'}</div>
                    ) : pagination.paginatedItems.map((chat) => {
                        const isSelected = selected && selected.phone === chat.phone && selected.phoneNumberId === chat.phoneNumberId;
                        return (
                            <button
                                type="button"
                                key={`${chat.phone}-${chat.phoneNumberId}`}
                                className={`wa-inbox-item ${isSelected ? 'selected' : ''} ${Number(chat.unread_count) > 0 ? 'unread' : ''}`}
                                onClick={() => openConversation(chat)}
                            >
                                <div className="wa-inbox-avatar">{String(chatTitle(chat)).slice(0, 2).toUpperCase()}</div>
                                <div className="wa-inbox-body">
                                    <div className="wa-inbox-top">
                                        <strong>{chatTitle(chat)}</strong>
                                        <span>{relativeTime(chat.last_creationdate)}</span>
                                    </div>
                                    <div className="wa-inbox-preview">{chat.last_message_preview || chatSubtitle(chat) || chat.phone}</div>
                                    <div className="wa-inbox-meta">
                                        <em className={`wa-status ${chat.status || 'bot'}`}>{statusLabel(chat.status)}</em>
                                        {phoneLines.length > 1 ? <span className="wa-line-chip">{lineLabel(chat)}</span> : null}
                                        {chat.companyName ? <span>{chat.companyName}</span> : null}
                                        {chat.assignedUserName ? <span>{chat.assignedUserName}</span> : null}
                                    </div>
                                </div>
                                {Number(chat.unread_count) > 0 ? <b className="wa-unread">{chat.unread_count}</b> : null}
                            </button>
                        );
                    })}
                </div>
                <div className="wa-inbox-pager">
                    <TablePagination {...pagination} />
                </div>
            </aside>
            <div
                className="wa-inbox-splitter"
                role="separator"
                aria-orientation="vertical"
                aria-label="Ajustar ancho del listado"
                aria-valuemin={LIST_MIN}
                aria-valuenow={Math.round(listWidth)}
                tabIndex={0}
                onPointerDown={startListResize}
                onDoubleClick={() => {
                    preferredListWidthRef.current = LIST_DEFAULT;
                    fitListWidth(LIST_DEFAULT);
                    localStorage.setItem('wantrack.inboxListWidth', String(LIST_DEFAULT));
                }}
                onKeyDown={(event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    event.preventDefault();
                    const delta = event.key === 'ArrowRight' ? 24 : -24;
                    const shellWidth = shellRef.current?.getBoundingClientRect().width || listWidth + THREAD_MIN;
                    const next = clampListWidth(preferredListWidthRef.current + delta, shellWidth);
                    preferredListWidthRef.current = next;
                    setListWidth(next);
                    localStorage.setItem('wantrack.inboxListWidth', String(Math.round(next)));
                }}
            />
            <section className="wa-inbox-thread">
                {selected ? (
                    <Chat
                        embedded
                        selected={selected}
                        lineLabel={phoneLines.length > 1 ? lineLabel(selected, linesSpanCompanies) : (isAdmin && selected?.companyName ? String(selected.companyName) : '')}
                        onBack={() => setSelected(null)}
                    />
                ) : (
                    <div className="wa-inbox-empty">Selecciona una conversación para ver el historial.</div>
                )}
            </section>
        </div>
    </div>;
}

export default Chats;
