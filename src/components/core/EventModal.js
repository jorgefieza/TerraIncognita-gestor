// src/components/core/EventModal.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import useClickOutside from '../../utils/useClickOutside';
import eventService from '../../services/eventService';
import { format, parseISO, set, addDays, areIntervalsOverlapping } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AlertTriangleIcon, TrashIcon, XCircleIcon, CheckCircleIcon, UsersIcon, PlusIcon, PencilIcon, XMarkIcon } from './Icons';

const EventModal = () => {
    const { events, allEquipment, allProfessionals, allClients, allSkills, allDocks, allProducts } = useData();
    const { user: currentUser, department, permissions, role } = useAuth();
    const { isEventModalOpen, closeEventModal, selectedEvent, selectedDate, openTaskModal } = useUI();

    const [eventDepartment, setEventDepartment] = useState(department || 'Turismo');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [note, setNote] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [isEquipmentSearchOpen, setEquipmentSearchOpen] = useState(false);
    const [selectedProfessionals, setSelectedProfessionals] = useState([]);
    const [professionalSearch, setProfessionalSearch] = useState('');
    const [isProfessionalSearchOpen, setProfessionalSearchOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
    const [financialDetails, setFinancialDetails] = useState({ grossValue: '', commissionType: '%', commissionValue: '', iva: '23', isPaid: false });
    const [boardingPointId, setBoardingPointId] = useState('');
    const [disembarkingPointId, setDisembarkingPointId] = useState('');

    const equipmentSearchRef = useRef(null);
    const professionalSearchRef = useRef(null);
    const clientSearchRef = useRef(null);
    const productSearchRef = useRef(null);
    useClickOutside(equipmentSearchRef, () => setEquipmentSearchOpen(false));
    useClickOutside(professionalSearchRef, () => setProfessionalSearchOpen(false));
    useClickOutside(clientSearchRef, () => setIsClientSearchOpen(false));
    useClickOutside(productSearchRef, () => setIsProductSearchOpen(false));

    const timeOptions = useMemo(() => Array.from({ length: 24 * 4 }, (_, i) => { const h = Math.floor(i / 4); const m = (i % 4) * 15; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }), []);
    const canEditCurrentEvent = selectedEvent ? permissions.canEditEvent(currentUser, selectedEvent) : permissions.canCreateEvent;
    const showFinancials = useMemo(() => { if (!selectedClient) return false; return ['Agência', 'Comercial'].includes(selectedClient.type); }, [selectedClient]);
    const getSkillName = useCallback((skillId) => allSkills.find(s => s.id === skillId)?.name || 'N/A', [allSkills]);

    const associatedTasks = useMemo(() => {
        if (!selectedEvent) return [];
        return events.filter(e => e.parentId === selectedEvent.id).sort((a, b) => parseISO(a.start) - parseISO(b.start));
    }, [events, selectedEvent]);

    const checkResourceAvailability = useCallback((resourceName, resourceType, interval) => {
        const otherEvents = events.filter(e => e.id !== (selectedEvent?.id || null));
        for (const e of otherEvents) {
            let eventInterval = { start: parseISO(e.start), end: parseISO(e.end) };
            if (areIntervalsOverlapping(interval, eventInterval, { inclusive: false })) {
                if (e.type === 'Indisponibilidade' && e.resourceType === resourceType && e.resourceName === resourceName) return { status: 'unavailable', reason: `Indisponível: ${e.reason || ''}` };
                const list = resourceType === 'equipment' ? e.equipment : e.professionals;
                if (list?.some(r => r.name === resourceName)) {
                    const isConfirmed = e.status === 'Confirmado';
                    if (isConfirmed) return { status: 'unavailable', reason: `Conflito com evento confirmado (${e.title || 'Evento sem título'})` };
                    return { status: 'conflicting', reason: `Conflito com evento em standby (${e.title || 'Evento sem título'})` };
                }
            }
        }
        return { status: 'available' };
    }, [events, selectedEvent]);

    const suggestedEquipment = useMemo(() => {
        if (!isEventModalOpen) return [];
        const searchTerm = equipmentSearch.toLowerCase().trim();
        if (searchTerm.length < 3) return [];
        const currentInterval = { start: parseISO(`${startDate}T${startTime}`), end: parseISO(`${endDate}T${endTime}`) };
        if (isNaN(currentInterval.start) || isNaN(currentInterval.end)) return [];
        return allEquipment
            .map(e => ({ ...e, availability: checkResourceAvailability(e.name, 'equipment', currentInterval) }))
            .filter(e => e.name.toLowerCase().includes(searchTerm));
    }, [equipmentSearch, allEquipment, startDate, startTime, endDate, endTime, checkResourceAvailability, isEventModalOpen]);

    const suggestedProfessionals = useMemo(() => {
        if (!isEventModalOpen) return [];
        const searchTerm = professionalSearch.toLowerCase().trim();
        if (searchTerm.length < 3) return [];
        const currentInterval = { start: parseISO(`${startDate}T${startTime}`), end: parseISO(`${endDate}T${endTime}`) };
        if (isNaN(currentInterval.start) || isNaN(currentInterval.end)) return [];
        const professionalsWithStatus = allProfessionals.flatMap(p => {
            const availability = checkResourceAvailability(p.name, 'professional', currentInterval);
            const results = [];
            const nameMatch = p.name.toLowerCase().includes(searchTerm);
            const matchingSkills = p.skills?.filter(skill => getSkillName(skill.id).toLowerCase().includes(searchTerm)) || [];
            if (nameMatch) {
                (p.skills && p.skills.length > 0 ? p.skills : [{ id: null }]).forEach(skill => {
                    const skillName = getSkillName(skill.id);
                    results.push({ ...p, idWithSkill: `${p.id}-${skill.id}`, displayName: skillName !== 'N/A' ? `${p.name} (${skillName})` : p.name, selectedSkillId: skill.id, availability: availability, matchType: 'name' });
                });
            } else if (matchingSkills.length > 0) {
                matchingSkills.forEach(skill => {
                    const skillName = getSkillName(skill.id);
                    results.push({ ...p, idWithSkill: `${p.id}-${skill.id}`, displayName: `${p.name} (${skillName})`, selectedSkillId: skill.id, availability: availability, matchType: 'skill' });
                });
            }
            return results;
        });
        professionalsWithStatus.sort((a, b) => {
            if (a.matchType === 'skill' && b.matchType !== 'skill') return -1;
            if (a.matchType !== 'skill' && b.matchType === 'skill') return 1;
            return a.displayName.localeCompare(b.displayName);
        });
        return Array.from(new Map(professionalsWithStatus.map(p => [p.displayName, p])).values());
    }, [professionalSearch, allProfessionals, startDate, startTime, endDate, endTime, checkResourceAvailability, isEventModalOpen, getSkillName, allSkills]);

    const suggestedClients = useMemo(() => {
        const searchTerm = clientSearch.toLowerCase().trim();
        if (searchTerm.length < 3) return [];
        return allClients.filter(c => c.name.toLowerCase().includes(searchTerm));
    }, [clientSearch, allClients]);
    
    const suggestedProducts = useMemo(() => {
        const searchTerm = productSearch.toLowerCase().trim();
        if (searchTerm.length < 3) return [];
        return allProducts.filter(p => p.name.toLowerCase().includes(searchTerm) && p.department === eventDepartment);
    }, [productSearch, allProducts, eventDepartment]);

    useEffect(() => {
        if (isEventModalOpen) {
            const initialEvent = selectedEvent || {};
            const client = initialEvent.clientId ? allClients.find(c => c.id === initialEvent.clientId) : null;
            const product = initialEvent.productId ? allProducts.find(p => p.id === initialEvent.productId) : null;
            
            setEventDepartment(initialEvent.department || department || 'Turismo');
            setNote(initialEvent.note || '');
            setFinancialDetails(initialEvent.financialDetails || { grossValue: '', commissionType: '%', commissionValue: '', iva: '23', isPaid: false });
            setBoardingPointId(initialEvent.boardingPointId || '');
            setDisembarkingPointId(initialEvent.disembarkingPointId || '');
            const dateStr = format(selectedEvent ? parseISO(initialEvent.start) : selectedDate, 'yyyy-MM-dd');
            setStartDate(dateStr);
            setEndDate(selectedEvent ? format(parseISO(initialEvent.end), 'yyyy-MM-dd') : dateStr);
            if (selectedEvent) {
                setStartTime(format(parseISO(initialEvent.start), 'HH:mm'));
                setEndTime(format(parseISO(initialEvent.end), 'HH:mm'));
            } else {
                const now = new Date();
                const nextHour = set(now, { minutes: 0, seconds: 0, milliseconds: 0 });
                setStartTime(format(addDays(nextHour, 1), 'HH:00'));
                setEndTime(format(addDays(nextHour, 2), 'HH:00'));
            }
            setSelectedEquipment(initialEvent.equipment || []);
            setSelectedProfessionals(initialEvent.professionals || []);
            setSelectedClient(client);
            setClientSearch(client ? client.name : '');
            setSelectedProductId(initialEvent.productId || '');
            setProductSearch(product ? product.name : '');
            setEquipmentSearch('');
            setProfessionalSearch('');
        }
    }, [selectedEvent, isEventModalOpen, selectedDate, department, allClients, allProducts]);

    useEffect(() => { if (startDate) setEndDate(startDate); }, [startDate]);
    useEffect(() => { if (boardingPointId && !disembarkingPointId) setDisembarkingPointId(boardingPointId); }, [boardingPointId, disembarkingPointId]);

    const handleFinancialChange = (e) => { 
        const { name, value, type, checked } = e.target;
        setFinancialDetails(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSave = () => {
        const startDateTime = parseISO(`${startDate}T${startTime}`);
        const endDateTime = parseISO(`${endDate}T${endTime}`);
        if (endDateTime <= startDateTime) {
            alert("Erro: A hora de fim deve ser posterior à hora de início.");
            return;
        }

        let finalTitle = '';
        if (eventDepartment === 'Comercial') {
            if (!selectedClient) {
                alert("Por favor, selecione um cliente para eventos comerciais.");
                return;
            }
            finalTitle = selectedClient.name;
        } else {
            if (!selectedProductId) {
                alert("Por favor, selecione um produto para eventos de Turismo ou Escola.");
                return;
            }
            const product = allProducts.find(p => p.id === selectedProductId);
            finalTitle = product ? product.name : 'Evento';
        }

        const hasEquipment = selectedEquipment.length > 0;
        const hasProfessionals = selectedProfessionals.length > 0;
        const requiredProfessionals = hasEquipment ? Math.max(0, ...allEquipment.filter(e => selectedEquipment.some(se => se.name === e.name)).map(e => e.minProfessionals || 0)) : 0;
        let finalStatus;
        if (selectedEvent?.status === 'Cancelado') {
            finalStatus = 'Cancelado';
        } else if (hasEquipment && selectedProfessionals.length < requiredProfessionals) {
            finalStatus = 'Standby';
        } else {
            const allConfirmed = (hasEquipment || hasProfessionals) && selectedEquipment.every(e => e.confirmed) && selectedProfessionals.every(p => p.confirmed);
            finalStatus = allConfirmed ? 'Confirmado' : 'Standby';
        }
        const eventData = { title: finalTitle, department: eventDepartment, status: finalStatus, start: startDateTime.toISOString(), end: endDateTime.toISOString(), equipment: selectedEquipment, professionals: selectedProfessionals, clientId: selectedClient?.id || '', productId: selectedProductId || '', note, type: 'Evento Padrão', financialDetails: showFinancials ? financialDetails : null, boardingPointId, disembarkingPointId };
        eventService.save(selectedEvent ? { ...selectedEvent, ...eventData } : eventData, currentUser);
        closeEventModal();
    };
    
    const handleCancelEvent = () => { if (selectedEvent && permissions.canCancelEvent) { if (window.confirm(`Tem a certeza que quer CANCELAR o evento "${selectedEvent.title}"?`)) { eventService.save({ ...selectedEvent, status: 'Cancelado' }, currentUser); closeEventModal(); } } };
    const handleDelete = () => { if (selectedEvent?.id && permissions.canDeleteEvent) { if (window.confirm(`Tem a certeza que quer EXCLUIR PERMANENTEMENTE o evento "${selectedEvent.title}"? Esta ação não pode ser revertida.`)) { eventService.delete(selectedEvent.id); closeEventModal(); } } };
    
    const addResource = (resource, type) => {
        const currentInterval = { start: parseISO(`${startDate}T${startTime}`), end: parseISO(`${endDate}T${endTime}`) };
        const availability = checkResourceAvailability(resource.name, type, currentInterval);
        if (type === 'equipment') {
            if (!selectedEquipment.some(e => e.name === resource.name)) setSelectedEquipment(prev => [...prev, { name: resource.name, confirmed: false, conflict: availability.status === 'conflicting' }]);
            setEquipmentSearchOpen(false);
            setEquipmentSearch('');
        } else {
            if (selectedProfessionals.some(p => p.name === resource.name)) {
                alert(`O profissional ${resource.name} já foi adicionado a este evento.`);
                return;
            }
            setSelectedProfessionals(prev => [...prev, { name: resource.name, skillId: resource.selectedSkillId, confirmed: false, conflict: availability.status === 'conflicting' }]);
            setProfessionalSearchOpen(false);
            setProfessionalSearch('');
        }
    };
    
    const removeResource = (index, type) => {
        if (type === 'equipment') setSelectedEquipment(prev => prev.filter((_, i) => i !== index));
        else setSelectedProfessionals(prev => prev.filter((_, i) => i !== index));
    };
    
    const toggleConfirmation = (index, type) => {
        if (!canEditCurrentEvent) return;
        const currentInterval = { start: parseISO(`${startDate}T${startTime}`), end: parseISO(`${endDate}T${endTime}`) };
        const resourceList = type === 'equipment' ? selectedEquipment : selectedProfessionals;
        const resource = resourceList[index];
        if (resource.confirmed) {
            const newSelection = [...resourceList];
            newSelection[index].confirmed = false;
            if (type === 'equipment') setSelectedEquipment(newSelection);
            else setSelectedProfessionals(newSelection);
            return;
        }
        const availability = checkResourceAvailability(resource.name, type, currentInterval);
        if (availability.status !== 'available') {
            alert(`Não é possível confirmar. Motivo: ${availability.reason}`);
            return;
        }
        const newSelection = [...resourceList];
        newSelection[index].confirmed = true;
        if (type === 'equipment') setSelectedEquipment(newSelection);
        else setSelectedProfessionals(newSelection);
    };

    if (!isEventModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto relative">
                <button onClick={closeEventModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 print-hidden z-10"><XMarkIcon className="w-6 h-6"/></button>
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
                    <fieldset disabled={!canEditCurrentEvent}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Início</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /><select value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full mt-2">{timeOptions.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Fim</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /><select value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full mt-2">{timeOptions.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Ponto de Embarque</label><select value={boardingPointId} onChange={e => setBoardingPointId(e.target.value)}><option value="">Padrão (Doca de St Amaro)</option>{allDocks.map(dock => <option key={dock.id} value={dock.id}>{dock.name}</option>)}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Ponto de Desembarque</label><select value={disembarkingPointId} onChange={e => setDisembarkingPointId(e.target.value)}><option value="">Padrão (Doca de St Amaro)</option>{allDocks.map(dock => <option key={dock.id} value={dock.id}>{dock.name}</option>)}</select></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                    <select name="department" value={eventDepartment} onChange={e => setEventDepartment(e.target.value)}><option value="Turismo">Turismo</option><option value="Comercial">Comercial</option><option value="Escola">Escola</option></select>
                                </div>
                                {eventDepartment === 'Comercial' && (
                                    <div className="relative" ref={clientSearchRef}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                        <input type="text" placeholder="Digite para procurar um cliente..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} onFocus={() => setIsClientSearchOpen(true)} />
                                        {isClientSearchOpen && (<div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">{suggestedClients.map(c => <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(c.name); setIsClientSearchOpen(false); }} className="w-full text-left p-2 hover:bg-gray-50">{c.name}</button>)}</div>)}
                                        {selectedClient && !isClientSearchOpen && <button onClick={() => {setSelectedClient(null); setClientSearch('');}} className="absolute top-7 right-2 text-gray-400 hover:text-red-500"><XCircleIcon /></button>}
                                    </div>
                                )}
                                {(eventDepartment === 'Turismo' || eventDepartment === 'Escola') && (
                                    <div className="relative" ref={productSearchRef}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                                        <input type="text" placeholder="Digite para procurar um produto..." value={productSearch} onChange={e => setProductSearch(e.target.value)} onFocus={() => setIsProductSearchOpen(true)} />
                                        {isProductSearchOpen && (<div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">{suggestedProducts.map(p => <button key={p.id} onClick={() => { setSelectedProductId(p.id); setProductSearch(p.name); setIsProductSearchOpen(false); }} className="w-full text-left p-2 hover:bg-gray-50">{p.name}</button>)}</div>)}
                                        {selectedProductId && !isProductSearchOpen && <button onClick={() => {setSelectedProductId(''); setProductSearch('');}} className="absolute top-7 right-2 text-gray-400 hover:text-red-500"><XCircleIcon /></button>}
                                    </div>
                                )}
                                {showFinancials && (<div className="p-3 border border-gray-200 rounded-md space-y-3 bg-gray-50">
                                    <h4 className="text-sm font-bold text-gray-600">Detalhes Financeiros</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input type="checkbox" id="isPaid" name="isPaid" checked={financialDetails.isPaid} onChange={handleFinancialChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                            <label htmlFor="isPaid" className="ml-2 block text-sm font-medium text-green-700">Pago</label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="block text-xs font-medium text-gray-600">Valor Bruto (€)</label><input type="number" name="grossValue" value={financialDetails.grossValue} onChange={handleFinancialChange} /></div>
                                        <div><label className="block text-xs font-medium text-gray-600">IVA (%)</label><input type="number" name="iva" value={financialDetails.iva} onChange={handleFinancialChange} /></div>
                                    </div>
                                    <div><label className="block text-xs font-medium text-gray-600">Agência</label>
                                        {/* Futuramente, será um campo de busca */}
                                        <select name="agencyId" className="w-full mt-1"><option value="">Nenhuma</option></select>
                                    </div>
                                    <div><label className="block text-xs font-medium text-gray-600">Comissão</label><div className="flex"><input type="number" name="commissionValue" value={financialDetails.commissionValue} onChange={handleFinancialChange} disabled={true} /><select name="commissionType" value={financialDetails.commissionType} onChange={handleFinancialChange} disabled={true}><option value="%">%</option><option value="€">€</option></select></div></div>
                                </div>)}
                            </div>
                            <div className="space-y-4">
                                <div className="relative" ref={equipmentSearchRef}><label className="block text-sm font-medium text-gray-700 mb-1">Equipamentos</label><input type="text" placeholder="Digite um termo" value={equipmentSearch} onChange={e => setEquipmentSearch(e.target.value)} onFocus={() => setEquipmentSearchOpen(true)} className="mb-2" />
                                    {isEquipmentSearchOpen && (<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">{suggestedEquipment.map(e => { const isSelected = selectedEquipment.some(se => se.name === e.name); const isDisabled = isSelected || e.availability.status === 'unavailable'; return (<button key={e.id} onClick={() => addResource(e, 'equipment')} disabled={isDisabled} className={`w-full text-left p-2 flex justify-between items-center ${isDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}><div className="flex flex-col"><span>{e.name}</span>{e.minProfessionals > 0 && <span className="text-xs text-gray-500 flex items-center"><UsersIcon className="w-3 h-3 mr-1" /> Mín. {e.minProfessionals}</span>}</div>{e.availability.status === 'conflicting' && <span title={e.availability.reason}><AlertTriangleIcon className="w-4 h-4 text-orange-500" /></span>}{e.availability.status === 'unavailable' && <span title={e.availability.reason}><AlertTriangleIcon className="w-4 h-4 text-red-600" /></span>}</button>);})}</div>)}
                                    <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">{selectedEquipment.map((eq, index) => {
                                        const equipmentDetails = allEquipment.find(e => e.name === eq.name);
                                        return (<div key={`${eq.name}-${index}`} className="flex justify-between items-center bg-gray-100 rounded p-1.5 text-sm"><div className="flex items-center gap-2">{eq.conflict && <span title="Este recurso tem um conflito de horário"><AlertTriangleIcon className="w-4 h-4 text-orange-500" /></span>}<span>{eq.name}</span>{equipmentDetails?.minProfessionals > 0 && <span className="text-xs text-gray-500 flex items-center pl-2">(<UsersIcon className="w-3 h-3 mr-1" /> Mín. {equipmentDetails.minProfessionals})</span>}</div><div className="flex items-center gap-2"><button onClick={() => toggleConfirmation(index, 'equipment')}><CheckCircleIcon className={`w-5 h-5 ${eq.confirmed ? 'text-green-500' : 'text-gray-300'}`} /></button><button onClick={() => removeResource(index, 'equipment')} className="text-gray-500 hover:text-red-600"><XCircleIcon /></button></div></div>);
                                    })}</div>
                                </div>
                                <div className="relative" ref={professionalSearchRef}><label className="block text-sm font-medium text-gray-700 mb-1">Profissionais</label><input type="text" placeholder="Digite um nome ou habilidade" value={professionalSearch} onChange={e => setProfessionalSearch(e.target.value)} onFocus={() => setProfessionalSearchOpen(true)} className="mb-2" />
                                    {isProfessionalSearchOpen && (<div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">{suggestedProfessionals.map(p => { const isSelected = selectedProfessionals.some(sp => sp.name === p.name); const isDisabled = isSelected || p.availability.status === 'unavailable'; return <button key={p.idWithSkill} onClick={() => addResource(p, 'professional')} disabled={isDisabled} className={`w-full text-left p-2 flex justify-between items-center ${isDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}><span>{p.displayName}</span>{p.availability.status === 'conflicting' && <span title={e.availability.reason}><AlertTriangleIcon className="w-4 h-4 text-orange-500" /></span>}{p.availability.status === 'unavailable' && <span title={e.availability.reason}><AlertTriangleIcon className="w-4 h-4 text-red-600" /></span>}</button>})}</div>)}
                                    {isProfessionalSearchOpen && (<div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">{suggestedProfessionals.map(p => { const isSelected = selectedProfessionals.some(sp => sp.name === p.name); const isDisabled = isSelected || p.availability.status === 'unavailable'; return <button key={p.idWithSkill} onClick={() => addResource(p, 'professional')} disabled={isDisabled} className={`w-full text-left p-2 flex justify-between items-center ${isDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}><span>{p.displayName}</span>{p.availability.status === 'conflicting' && <span title={p.availability.reason}><AlertTriangleIcon className="w-4 h-4 text-orange-500" /></span>}{p.availability.status === 'unavailable' && <span title={p.availability.reason}><AlertTriangleIcon className="w-4 h-4 text-red-600" /></span>}</button>})}</div>)}
                                    <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">{selectedProfessionals.map((p, index) => (<div key={`${p.name}-${index}-${p.skillId}`} className="flex justify-between items-center bg-gray-100 rounded p-1.5 text-sm"><div className="flex items-center gap-2">{p.conflict && <span title="Este profissional tem um conflito de horário"><AlertTriangleIcon className="w-4 h-4 text-orange-500" /></span>}<span>{getSkillName(p.skillId) !== 'N/A' ? `${p.name} (${getSkillName(p.skillId)})` : p.name}</span></div><div className="flex items-center gap-2"><button onClick={() => toggleConfirmation(index, 'professional')}><CheckCircleIcon className={`w-5 h-5 ${p.confirmed ? 'text-green-500' : 'text-gray-300'}`} /></button><button onClick={() => removeResource(index, 'professional')} className="text-gray-500 hover:text-red-600"><XCircleIcon /></button></div></div>))}</div>
                                </div>
                                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Notas do Evento</label><textarea name="note" value={note} onChange={(e) => setNote(e.target.value)} rows="2" placeholder="Instruções especiais..."></textarea></div>
                            </div>
                        </div>
                    </fieldset>
                    <div className="flex justify-between items-center mt-8 pt-4 border-t">
                        <div>
                            {selectedEvent?.lastModifiedAt && (
                                <div className="text-xs text-gray-400">
                                    <p>Última alteração:</p>
                                    <p>{format(selectedEvent.lastModifiedAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: pt })} por {selectedEvent.lastModifiedBy}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedEvent?.status === 'Cancelado' && permissions.canDeleteEvent && (
                                <button onClick={handleDelete} title="Excluir Permanentemente" className="text-red-600 hover:text-red-800 font-medium p-2 rounded-md hover:bg-red-50"><TrashIcon /></button>
                            )}
                            {selectedEvent?.status !== 'Cancelado' && permissions.canCancelEvent && (
                                <button onClick={handleCancelEvent} title="Cancelar Evento" className="text-gray-500 hover:text-red-600 font-medium p-2 rounded-md hover:bg-gray-100"><XCircleIcon /></button>
                            )}
                            {canEditCurrentEvent && (
                                <button onClick={handleSave} title="Guardar Alterações" className="flex items-center p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                    <CheckCircleIcon className="w-6 h-6"/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;