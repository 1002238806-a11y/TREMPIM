
import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Calendar, Car, Bell, Info, Clock, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { BUS_SCHEDULES, MOCK_RIDES, MOCK_EMAIL_REQUESTS } from './constants';
import { DESTINATIONS, Ride } from './types';
import { getCurrentTime, mergeAndSortTransport, formatHebrewDate } from './utils';
import RideCard from './components/RideCard';
import BusCard from './components/BusCard';
import AddRideForm from './components/AddRideForm';
import AdminLogin from './components/Login'; // Now serves as Admin Modal
import EmailFeedItem from './components/EmailFeedItem';
import AlertsModal from './components/AlertsModal';
import EmailSyncHelp from './components/EmailSyncHelp';
import { AnimatePresence, motion } from 'framer-motion';

// Firebase Imports (Only Firestore needed now)
import { db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query } from 'firebase/firestore';

const App = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  
  // Identity & Permissions
  const [myUserId, setMyUserId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showEmailHelp, setShowEmailHelp] = useState(false);
  
  // Filters
  const [filterDest, setFilterDest] = useState('הכל');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Time Range Filter
  const [timeRange, setTimeRange] = useState({
    start: getCurrentTime(),
    end: '23:59'
  });

  // Tabs
  const [activeTab, setActiveTab] = useState<'app' | 'email'>('app');

  // 1. Initialization (Identity + Firebase Check)
  useEffect(() => {
    // Generate or retrieve anonymous User ID for "My Rides" logic
    let storedId = localStorage.getItem('my_user_id');
    if (!storedId) {
      storedId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('my_user_id', storedId);
    }
    setMyUserId(storedId);

    // Check Firebase
    if (db) {
      setIsFirebaseReady(true);
      // Listen to Rides Collection
      const q = query(collection(db, "rides"));
      const unsubscribeRides = onSnapshot(q, (snapshot) => {
        const ridesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ride[];
        setRides(ridesData);
        setIsLoading(false);
      });
      return () => unsubscribeRides();
    } else {
      console.warn("Firebase not configured. Using Mock Data.");
      setRides(MOCK_RIDES);
      setIsFirebaseReady(false);
      setIsLoading(false);
    }
  }, []);

  const handleAddRide = async (newRide: Ride) => {
    if (isFirebaseReady && db) {
      // Add to Firestore
      const { id, ...rideData } = newRide;
      try {
        await addDoc(collection(db, "rides"), rideData);
      } catch (e) {
        alert("שגיאה בהוספת נסיעה");
      }
    } else {
      // Mock mode
      setRides([newRide, ...rides]);
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את הנסיעה?")) {
      if (isFirebaseReady && db) {
        try {
          await deleteDoc(doc(db, "rides", rideId));
        } catch (e) {
          alert("שגיאה במחיקת נסיעה");
        }
      } else {
        // Mock mode
        setRides(rides.filter(r => r.id !== rideId));
      }
    }
  };

  const transportItems = mergeAndSortTransport(
    rides, 
    BUS_SCHEDULES, 
    filterDest, 
    timeRange,
    selectedDate
  );

  const filteredEmailRequests = MOCK_EMAIL_REQUESTS.filter(req => {
      const matchesDest = filterDest === 'הכל' || 
          req.detectedOrigin.includes(filterDest) || 
          req.detectedDestination.includes(filterDest) ||
          req.originalBody.includes(filterDest);
      return matchesDest;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black pb-12 text-slate-200 font-sans">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          
          {/* Top Row: Logo & Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                 <Car size={20} className="text-white" />
               </div>
               <div>
                <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300 leading-none">
                  טרמפי עמוס
                </h1>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  קהילת טרמפים ותחבורה חכמה
                </p>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAlertsModal(true)}
                className="p-2 rounded-full bg-white/5 hover:bg-yellow-500/20 text-yellow-500 transition-colors border border-white/5"
                title="קבלת התראות"
              >
                <Bell size={20} />
              </button>

              <button
                onClick={() => {
                  if (isAdmin) {
                    if (window.confirm("להתנתק ממצב מנהל?")) setIsAdmin(false);
                  } else {
                    setShowAdminLogin(true);
                  }
                }}
                className={`p-2 rounded-full transition-colors border border-white/5 ${isAdmin ? 'bg-red-500 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                title="ניהול מערכת"
              >
                {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
              </button>
            </div>
          </div>

          {/* Config Alert */}
          {!isFirebaseReady && !isLoading && (
              <div className="mb-4 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="text-xs font-bold text-orange-400">מצב הדגמה (ללא שמירה בענן)</h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                          האפליקציה פועלת עם נתונים מקומיים. כדי להפוך אותה לאמיתית, יש להוסיף את מפתחות ה-Firebase.
                      </p>
                  </div>
              </div>
          )}

          {isAdmin && (
            <div className="bg-red-600/20 border border-red-500/30 text-red-200 text-xs px-3 py-2 rounded-lg mb-4 text-center font-bold">
               מחובר כמנהל מערכת - באפשרותך למחוק כל תוכן
            </div>
          )}

          {/* Search & Filter Panel */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-3">
            
            {/* Row 1: Destination Scroll */}
            <div className="overflow-x-auto no-scrollbar flex items-center gap-2">
              <button 
                onClick={() => setFilterDest('הכל')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  filterDest === 'הכל' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                הכל
              </button>
              {DESTINATIONS.map(dest => (
                <button 
                  key={dest}
                  onClick={() => setFilterDest(dest)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    filterDest === dest
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>

            {/* Row 2: Controls (Date, Time Range, Free Search) */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-900/50 rounded-lg px-2 py-1.5 border border-white/5 grow md:grow-0">
                    <Calendar size={14} className="text-gray-500 ml-2" />
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-white text-xs font-medium focus:outline-none w-full"
                    />
                </div>
                
                {/* Time Range Filter */}
                <div className="flex items-center bg-slate-900/50 rounded-lg px-2 py-1.5 border border-white/5 gap-1">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-[10px] text-gray-400">מ:</span>
                    <input 
                      type="time" 
                      value={timeRange.start}
                      onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                      className="bg-transparent text-white text-xs font-bold focus:outline-none w-14"
                    />
                    <span className="text-[10px] text-gray-400">-</span>
                    <input 
                      type="time" 
                      value={timeRange.end}
                      onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                      className="bg-transparent text-white text-xs font-bold focus:outline-none w-14"
                    />
                </div>

                <div className="flex items-center bg-slate-900/50 rounded-lg px-3 py-1.5 border border-white/5 flex-1 min-w-[150px]">
                  <Search size={14} className="text-gray-500 ml-2" />
                  <input 
                    type="text" 
                    placeholder="חיפוש חופשי..." 
                    onChange={(e) => setFilterDest(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white text-xs w-full"
                  />
                </div>
            </div>
            
            {/* Display Selected Date Readable - Hebrew */}
            <div className="text-[11px] text-blue-300 font-medium text-center bg-blue-900/10 py-1 rounded">
               {formatHebrewDate(selectedDate)}
            </div>

          </div>

          {/* Tabs */}
          <div className="flex mt-4 border-b border-white/10">
             <button 
                onClick={() => setActiveTab('app')}
                className={`flex-1 pb-2 text-sm font-bold transition-colors relative ${activeTab === 'app' ? 'text-blue-400' : 'text-gray-500'}`}
             >
                נסיעות באפליקציה
                {activeTab === 'app' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
             </button>
             <button 
                onClick={() => setActiveTab('email')}
                className={`flex-1 pb-2 text-sm font-bold transition-colors relative ${activeTab === 'email' ? 'text-pink-400' : 'text-gray-500'}`}
             >
                בקשות מהמייל
                {activeTab === 'email' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-400" />}
             </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        
        {/* FAB for Mobile */}
        <div className="md:hidden mb-4">
           <button 
               onClick={() => setShowAddForm(true)}
               className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
           >
             <Plus size={18} />
             פרסם טרמפ
           </button>
        </div>
        
        {/* Desktop Add Button */}
        <div className="hidden md:flex justify-end mb-4">
            <button 
               onClick={() => setShowAddForm(true)}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/25"
            >
               <Plus size={18} />
               פרסם נסיעה חדשה
            </button>
        </div>

        {activeTab === 'app' ? (
            <>
               {transportItems.length === 0 ? (
                 <div className="text-center py-20 opacity-50 flex flex-col items-center">
                   <div className="p-4 rounded-full bg-white/5 mb-4 border border-white/10">
                     <MapPin size={32} className="text-gray-500" />
                   </div>
                   <p className="text-gray-400">לא נמצאו נסיעות בין השעות {timeRange.start} - {timeRange.end} ליעד זה.</p>
                 </div>
               ) : (
                 <motion.div 
                   layout 
                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                 >
                   <AnimatePresence mode="popLayout">
                     {transportItems.map((item) => (
                       <React.Fragment key={item.id}>
                         {item.type === 'ride' ? (
                           <RideCard 
                             ride={item.data as Ride} 
                             currentUserId={myUserId}
                             isAdmin={isAdmin}
                             onDelete={handleDeleteRide}
                           />
                         ) : (
                           <BusCard 
                             line={(item.data as any).line} 
                             departureTime={(item.data as any).departureTime} 
                           />
                         )}
                       </React.Fragment>
                     ))}
                   </AnimatePresence>
                 </motion.div>
               )}
            </>
        ) : (
            <div className="max-w-2xl mx-auto">
               <div className="flex justify-between items-center mb-4">
                   <p className="text-xs text-pink-200 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
                      כאן מוצגות בקשות שנשלחו לקבוצת המייל של היישוב.
                   </p>
                   <button 
                     onClick={() => setShowEmailHelp(true)}
                     className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded"
                   >
                     <Info size={10} />
                     איך לחבר למייל?
                   </button>
               </div>

               {filteredEmailRequests.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">אין הודעות רלוונטיות מהמייל</div>
               ) : (
                  filteredEmailRequests.map(req => (
                     <EmailFeedItem key={req.id} request={req} />
                  ))
               )}
            </div>
        )}

      </main>

      {/* Add Ride Form Modal */}
      {showAddForm && (
        <AddRideForm 
          onClose={() => setShowAddForm(false)} 
          onAdd={handleAddRide} 
          userId={myUserId}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin 
          onClose={() => setShowAdminLogin(false)}
          onAdminAuth={(status) => setIsAdmin(status)}
        />
      )}

      {showAlertsModal && (
        <AlertsModal onClose={() => setShowAlertsModal(false)} />
      )}

      {showEmailHelp && (
        <EmailSyncHelp onClose={() => setShowEmailHelp(false)} />
      )}
    </div>
  );
};

export default App;
