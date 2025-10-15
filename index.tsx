/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";

// Add Chart.js to the global scope for the type
declare const Chart: any;


// --- DATA DEFINITIONS ---
type DistrictData = {
    lat: number;
    lon: number;
};

type ProvinceData = Record<string, DistrictData>;

const LOCATIONS: Record<string, ProvinceData> = {
    "İzmir": {
        "Aliağa": { lat: 38.80, lon: 26.97 },
        "Bergama": { lat: 39.12, lon: 27.18 },
        "Bornova": { lat: 38.46, lon: 27.22 },
        "Çeşme": { lat: 38.32, lon: 26.30 },
        "Kemalpaşa": { lat: 38.43, lon: 27.42 },
        "Ödemiş": { lat: 38.23, lon: 27.97 }
    },
    "Manisa": {
        "Ahmetli": { lat: 38.51, lon: 27.94 },
        "Alaşehir": { lat: 38.35, lon: 28.52 },
        "Salihli": { lat: 38.48, lon: 28.14 },
        "Sarıgöl": { lat: 38.24, lon: 28.70 },
        "Turgutlu": { lat: 38.49, lon: 27.70 }
    },
    "Aydın": {
        "Efeler": { lat: 37.85, lon: 27.84 },
        "Nazilli": { lat: 37.91, lon: 28.32 },
        "Sultanhisar": { lat: 37.89, lon: 28.15 }
    },
    "Denizli": {
        "Buldan": { lat: 38.04, lon: 28.83 },
        "Çivril": { lat: 38.30, lon: 29.76 },
        "Honaz": { lat: 37.76, lon: 29.26 }
    },
    "Muğla": {
        "Fethiye": { lat: 36.65, lon: 29.12 },
        "Köyceğiz": { lat: 36.96, lon: 28.69 },
        "Milas": { lat: 37.31, lon: 27.78 }
    },
    "Afyonkarahisar": {
        "Dinar": { lat: 38.06, lon: 30.16 },
        "Sandıklı": { lat: 38.46, lon: 30.27 },
        "Sultandağı": { lat: 38.53, lon: 31.23 }
    },
    "Kütahya": {
        "Merkez": { lat: 39.42, lon: 29.98 },
        "Simav": { lat: 39.09, lon: 28.98 },
        "Şaphane": { lat: 39.02, lon: 29.21 }
    },
    "Uşak": {
        "Banaz": { lat: 38.74, lon: 29.74 },
        "Eşme": { lat: 38.40, lon: 28.97 },
        "Sivaslı": { lat: 38.50, lon: 29.68 }
    }
};


type CherryVariety = {
  requiredHours: number;
  description: string;
};

const CHERRY_VARIETIES: Record<string, CherryVariety> = {
  "0900 Ziraat": {
    requiredHours: 1200,
    description: "Türkiye'nin en popüler ve yaygın ihracat çeşitlerinden biridir. Yüksek soğuklama ihtiyacı vardır, bu nedenle kışları sert geçen bölgeler için idealdir. Meyveleri kalp şeklinde, iri ve lezzetlidir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Bing": {
    requiredHours: 750,
    description: "Dünyaca ünlü, tatlı ve gevrek bir Amerikan çeşididir. Orta düzeyde soğuklama ihtiyacı ile bilinir. Çatlamaya karşı hassas olabilir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Brooks": {
    requiredHours: 300,
    description: "Düşük soğuklama ihtiyacı olan erkenci bir çeşittir. Sıcak iklimlere daha iyi uyum sağlar. Meyveleri büyük, tatlı ve koyu kırmızıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Early Burlat": {
    requiredHours: 550,
    description: "Çok erkenci bir çeşittir. Düşük-orta soğuklama ihtiyacı ile bilinir. Meyveleri orta irilikte, parlak kırmızı renkli ve yumuşaktır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Early Lory": {
    requiredHours: 550,
    description: "Erkenci bir çeşit olup, Early Burlat'tan birkaç gün önce olgunlaşır. Düşük-orta soğuklama ihtiyacına sahiptir ve verimli bir türdür. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Kordia": {
    requiredHours: 900,
    description: "Geç sezon çeşitlerinden biridir. Yüksek soğuklama ihtiyacı vardır. Uzun saplı, kalp şeklinde, çok iri ve çatlamaya dayanıklı meyveleriyle bilinir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Lambert": {
    requiredHours: 800,
    description: "Geç olgunlaşan, verimli bir çeşittir. Orta-yüksek soğuklama ihtiyacı vardır. Meyveleri kalp şeklinde, koyu kırmızı ve tatlıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Napolyon": {
    requiredHours: 1100,
    description: "Beyaz kiraz olarak da bilinir. Yüksek soğuklama ihtiyacı vardır ve genellikle sanayilik (reçel, konserve) olarak kullanılır. Tozlayıcı olarak önemlidir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Regina": {
    requiredHours: 1000,
    description: "Geç olgunlaşan, yüksek kaliteli bir Alman çeşididir. Yüksek soğuklama ihtiyacı bulunur. Meyveleri çok iri, sert, lezzetli ve çatlamaya oldukça dayanıklıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Stella": {
    requiredHours: 750,
    description: "Kendine verimli ilk kiraz çeşitlerinden biridir. Orta düzeyde soğuklama ihtiyacı ile birçok bölgeye uyum sağlar. Meyveleri büyük, kalp şeklinde ve siyahtır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Sweetheart": {
    requiredHours: 800,
    description: "Geç sezon ve kendine verimli bir çeşittir. Orta-yüksek soğuklama ihtiyacı vardır. Çok verimlidir ve meyveleri parlak kırmızı, tatlıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Vista": {
    requiredHours: 750,
    description: "Orta mevsimde olgunlaşan, tatlı ve sulu bir çeşittir. Orta düzeyde soğuklama ihtiyacı ile geniş bir adaptasyon yeteneğine sahiptir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
};

const AUTO_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// --- STATE MANAGEMENT ---

type DailyTemp = {
  date: string;
  min: number;
  max: number;
};

type Notification = {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
};

type AiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

type RawHourlyData = {
    timestamp: string;
    temperature: number;
};

type AppState = {
  isLoading: boolean;
  selectedProvince: string;
  selectedDistrict: string;
  selectedVariety: string;
  dataSource: 'gemini' | 'open-meteo';
  selectedAiModel: AiModel;
  chillingThreshold: number;
  totalChillingHours: number | null;
  monthlyChillingHours: Record<string, number> | null;
  dailyTemperatures: DailyTemp[] | null;
  rawHourlyData: RawHourlyData[] | null;
  error: string | null;
  customPrompt: string;
  isRecommendationLoading: boolean;
  aiRecommendation: string | null;
  isAutoRefreshEnabled: boolean;
  isAutoRefreshing: boolean;
  lastUpdateTime: Date | null;
  lastUpdateType: 'manual' | 'auto' | null;
  activeControlTab: 'alerts' | 'dataSource' | 'advanced' | 'temperatureTrends';
  isComparisonLoading: boolean;
  yearlyComparisonData: Record<string, number> | null;
  notifications: Notification[];
  isThresholdMetAlertFired: boolean;
  alertedEvents: Record<string, boolean>;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  chartStartDate: string; // YYYY-MM-DD format for chart filtering
  chartEndDate: string;   // YYYY-MM-DD format for chart filtering
  monthlyChartType: 'bar' | 'pie';
  isHourlyAnalysisModalVisible: boolean;
  isMapLoading: boolean;
  districtAverageTemperatures: Record<string, number> | null;
  activeTrendChart: 'none' | 'daily' | 'monthly' | 'yearly';
  isTrendLoading: boolean;
  trendChartData: {
      daily?: DailyTemp[];
      monthly?: Record<string, number>;
      yearly?: Record<string, number>;
  } | null;
  trendChartError: string | null;
  isSmsAlertsEnabled: boolean;
  phoneNumber: string;
  isEmailAlertsEnabled: boolean;
  emailAddress: string;
};

function toSafeISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


const today = new Date();
const startYear = today.getMonth() < 10 ? today.getFullYear() - 1 : today.getFullYear();
const defaultStartDate = new Date(startYear, 10, 1); // November 1st

const state: AppState = {
  isLoading: false,
  selectedProvince: "İzmir",
  selectedDistrict: "Kemalpaşa",
  selectedVariety: "0900 Ziraat",
  dataSource: 'open-meteo',
  selectedAiModel: 'gemini-2.5-flash',
  chillingThreshold: 7.2,
  totalChillingHours: null,
  monthlyChillingHours: null,
  dailyTemperatures: null,
  rawHourlyData: null,
  error: null,
  customPrompt: '',
  isRecommendationLoading: false,
  aiRecommendation: null,
  isAutoRefreshEnabled: true,
  isAutoRefreshing: false,
  lastUpdateTime: null,
  lastUpdateType: null,
  activeControlTab: 'alerts',
  isComparisonLoading: false,
  yearlyComparisonData: null,
  notifications: [],
  isThresholdMetAlertFired: false,
  alertedEvents: {},
  startDate: toSafeISOString(defaultStartDate),
  endDate: toSafeISOString(today),
  chartStartDate: toSafeISOString(defaultStartDate),
  chartEndDate: toSafeISOString(today),
  monthlyChartType: 'bar',
  isHourlyAnalysisModalVisible: false,
  isMapLoading: false,
  districtAverageTemperatures: null,
  activeTrendChart: 'none',
  isTrendLoading: false,
  trendChartData: null,
  trendChartError: null,
  isSmsAlertsEnabled: false,
  phoneNumber: '',
  isEmailAlertsEnabled: false,
  emailAddress: '',
};

let temperatureChart: any | null = null;
let monthlyChillingChart: any | null = null;
let yearlyComparisonChart: any | null = null;
let hourlyAverageChart: any | null = null;
let trendChart: any | null = null;
let autoRefreshTimerId: number | null = null;

// --- DATA PROCESSING & API ---

function processWeatherData(hourlyData: { time: string[], temperature_2m: number[] }): {
    totalChillingHours: number;
    monthlyChillingHours: Record<string, number>;
    dailyTemperatures: DailyTemp[];
    rawHourlyData: RawHourlyData[];
} {
    const monthlyChillingHours: Record<string, number> = {};
    const dailyTemperatures: Record<string, { min: number; max: number; temps: number[] }> = {};
    let totalChillingHours = 0;
    const rawHourlyData: RawHourlyData[] = [];

    for (let i = 0; i < hourlyData.time.length; i++) {
        const date = new Date(hourlyData.time[i]);
        const temp = hourlyData.temperature_2m[i];

        rawHourlyData.push({ timestamp: date.toISOString(), temperature: temp });

        if (temp <= state.chillingThreshold) {
            totalChillingHours++;
            const monthKey = date.toLocaleString('tr-TR', { year: 'numeric', month: 'long' });
            monthlyChillingHours[monthKey] = (monthlyChillingHours[monthKey] || 0) + 1;
        }

        const dayKey = toSafeISOString(date);
        if (!dailyTemperatures[dayKey]) {
            dailyTemperatures[dayKey] = { min: temp, max: temp, temps: [] };
        }
        if (temp < dailyTemperatures[dayKey].min) dailyTemperatures[dayKey].min = temp;
        if (temp > dailyTemperatures[dayKey].max) dailyTemperatures[dayKey].max = temp;
        dailyTemperatures[dayKey].temps.push(temp);
    }
    
    const dailyTempsArray = Object.entries(dailyTemperatures).map(([date, data]) => ({
        date,
        min: data.min,
        max: data.max,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
        totalChillingHours: Math.round(totalChillingHours),
        monthlyChillingHours,
        dailyTemperatures: dailyTempsArray,
        rawHourlyData
    };
}

async function fetchAndProcessWeatherData(options: { isManual: boolean }) {
    if (state.isLoading) return;

    state.isLoading = true;
    state.error = null;
    if (options.isManual) {
        state.aiRecommendation = null;
        state.totalChillingHours = null;
    }
    rerenderApp();

    try {
        const location = LOCATIONS[state.selectedProvince][state.selectedDistrict];
        const { lat, lon } = location;
        const startDateStr = state.startDate;
        const endDateStr = state.endDate;

        if (startDateStr >= endDateStr) {
            throw new Error("Başlangıç tarihi, bitiş tarihinden önce olmalıdır.");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toSafeISOString(today);

        let combinedHourlyData: { time: string[], temperature_2m: number[] } = { time: [], temperature_2m: [] };

        const fetchWeatherData = async (url: string) => {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.reason || `Hava durumu verisi alınamadı. Sunucu durumu: ${response.status}`);
            }
            return response.json();
        };

        // Case 1: The entire range is historical.
        if (endDateStr < todayStr) {
            const apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=temperature_2m&timezone=auto`;
            const data = await fetchWeatherData(apiUrl);
            combinedHourlyData = data.hourly;
        }
        // Case 2: The range starts in the past and ends today or in the future.
        else if (startDateStr < todayStr) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = toSafeISOString(yesterday);

            const archiveApiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${yesterdayStr}&hourly=temperature_2m&timezone=auto`;
            const forecastApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${todayStr}&end_date=${endDateStr}&hourly=temperature_2m&timezone=auto`;

            // Fetch in parallel
            const [archiveData, forecastData] = await Promise.all([
                fetchWeatherData(archiveApiUrl),
                fetchWeatherData(forecastApiUrl)
            ]);

            // Combine results
            if (archiveData.hourly) {
                combinedHourlyData.time = [...archiveData.hourly.time];
                combinedHourlyData.temperature_2m = [...archiveData.hourly.temperature_2m];
            }
            if (forecastData.hourly) {
                combinedHourlyData.time.push(...forecastData.hourly.time);
                combinedHourlyData.temperature_2m.push(...forecastData.hourly.temperature_2m);
            }
        }
        // Case 3: The entire range is today or in the future.
        else {
            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=temperature_2m&timezone=auto`;
            const data = await fetchWeatherData(apiUrl);
            combinedHourlyData = data.hourly;
        }


        if (!combinedHourlyData || !combinedHourlyData.time || !combinedHourlyData.temperature_2m || combinedHourlyData.time.length === 0) {
             throw new Error("API'den gelen veri formatı geçersiz veya eksik.");
        }

        const processedData = processWeatherData(combinedHourlyData);

        state.totalChillingHours = processedData.totalChillingHours;
        state.monthlyChillingHours = processedData.monthlyChillingHours;
        state.dailyTemperatures = processedData.dailyTemperatures;
        state.rawHourlyData = processedData.rawHourlyData;
        state.lastUpdateTime = new Date();
        state.lastUpdateType = options.isManual ? 'manual' : 'auto';
        state.isThresholdMetAlertFired = false;
        
        // Update chart filters to match the analysis range
        state.chartStartDate = state.startDate;
        state.chartEndDate = state.endDate;

        if (options.isManual) {
            fetchAiRecommendation(); // This is non-blocking
        }

    } catch (err: any) {
        console.error("Error fetching or processing weather data:", err);
        state.error = err.message || "Bilinmeyen bir hata oluştu.";
        state.totalChillingHours = null;
        state.monthlyChillingHours = null;
        state.dailyTemperatures = null;
    } finally {
        state.isLoading = false;
        rerenderApp();
        startAutoRefresh();
    }
}


function stopAutoRefresh() {
    if (autoRefreshTimerId) {
        clearInterval(autoRefreshTimerId);
        autoRefreshTimerId = null;
    }
}

function startAutoRefresh() {
    stopAutoRefresh();
    if (state.isAutoRefreshEnabled && state.totalChillingHours !== null) {
        autoRefreshTimerId = window.setInterval(() => {
            fetchAndProcessWeatherData({ isManual: false });
        }, AUTO_REFRESH_INTERVAL_MS);
    }
}

async function fetchYearlyComparisonData(): Promise<Record<string, number>> {
    const location = LOCATIONS[state.selectedProvince][state.selectedDistrict];
    const { lat, lon } = location;

    // FIX: Parse date components from string to avoid timezone issues with `new Date()`.
    const [endYearStr, endMonthStr, endDayStr] = state.endDate.split('-');
    const currentYear = parseInt(endYearStr, 10);
    const endMonth = parseInt(endMonthStr, 10) - 1; // JS months are 0-indexed
    const endDay = parseInt(endDayStr, 10);
    
    const yearsToCompare = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    
    const yearlyData: Record<string, number> = {};
    const promises = yearsToCompare.map(async (year) => {
        const startYearForApi = endMonth < 10 ? year - 1 : year;
        const startDate = `${startYearForApi}-11-01`;
        const endDate = `${year}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        
        const apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m&timezone=auto`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) return;
            const data = await response.json();
            if (!data.hourly || !data.hourly.time) return;

            let chillingHours = 0;
            for (const temp of data.hourly.temperature_2m) {
                if (temp <= state.chillingThreshold) {
                    chillingHours++;
                }
            }
            yearlyData[year] = Math.round(chillingHours);
        } catch (e) {
            console.error(`Could not fetch data for year ${year}`, e);
        }
    });

    await Promise.all(promises);
    return yearlyData;
}

function generatePrompt(): string {
    return `Seçilen konum (${state.selectedProvince} - ${state.selectedDistrict}) ve kiraz çeşidi (${state.selectedVariety}) için bir tarım danışmanı gibi davran. Toplam soğuklama saati: ${state.totalChillingHours || 'henüz hesaplanmadı'}, bu çeşit için gereken saat: ${CHERRY_VARIETIES[state.selectedVariety]?.requiredHours}. Bu bilgilere dayanarak, bu çeşidin bu konum için uygunluğunu değerlendir. Olası riskleri (örneğin, ilkbahar donları, yetersiz soğuklama) ve avantajları belirt. Çiftçiye somut önerilerde bulun. Cevabını Markdown formatında, başlıklar ve listeler kullanarak yapılandır.`;
}

async function fetchAiRecommendation() {
    state.isRecommendationLoading = true;
    state.aiRecommendation = null;
    rerenderApp();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePrompt();

        const response = await ai.models.generateContent({
            model: state.selectedAiModel,
            contents: prompt,
        });

        const recommendationText = response.text;
        
        if (!recommendationText) {
            throw new Error("Yapay zeka boş bir yanıt döndürdü.");
        }

        state.aiRecommendation = recommendationText;

    } catch (err: any) {
        console.error("Error fetching AI recommendation:", err);
        state.aiRecommendation = `Yapay zeka analizi sırasında bir hata oluştu: ${err.message}`;
    } finally {
        state.isRecommendationLoading = false;
        rerenderApp();
    }
}

// --- DOM HELPERS ---
type ElementProps = Record<string, any>;
// FIX: Update h function to support SVG elements for icons. This resolves TypeScript errors
// for SVG tags not being in HTMLElementTagNameMap. The function now uses createElementNS
// for SVG elements and setAttribute('class', ...) for better compatibility.
function h<K extends keyof (HTMLElementTagNameMap & SVGElementTagNameMap)>(
  tag: K,
  props: ElementProps | null,
  ...children: (Node | string | null | undefined)[]
): (HTMLElementTagNameMap & SVGElementTagNameMap)[K] {
  const el = (tag === 'svg' || tag === 'path')
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag as keyof HTMLElementTagNameMap);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === 'className') {
        // Use setAttribute for class, as it works for both HTML and SVG elements.
        el.setAttribute('class', value.toString());
      } else if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
      } else if (value != null) {
        el.setAttribute(key, value.toString());
      }
    }
  }
  for (const child of children) {
    if (child) {
      el.append(child);
    }
  }
  return el as (HTMLElementTagNameMap & SVGElementTagNameMap)[K];
}
const div = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('div', props, ...children);
const p = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('p', props, ...children);
const h1 = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('h1', props, ...children);
const h2 = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('h2', props, ...children);
const h3 = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('h3', props, ...children);
const h4 = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('h4', props, ...children);
const span = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('span', props, ...children);
const label = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('label', props, ...children);
const select = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('select', props, ...children);
const option = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('option', props, ...children);
const button = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('button', props, ...children);
const input = (props: ElementProps | null, ...children: (Node | string | null | undefined)[]) => h('input', props, ...children);


// --- RENDER FUNCTIONS ---
function renderVarietyInfoCard(): HTMLElement {
    const variety = state.selectedVariety;
    const varietyData = CHERRY_VARIETIES[variety];

    if (!varietyData) return div({ className: 'card variety-info-card' });

    return div({ className: 'card variety-info-card' },
        h3({ }, variety),
        div({ className: 'required-hours-info' },
            span({ }, 'İhtiyaç Duyulan Soğuklama Süresi'),
            div({ className: 'required-hours-value' },
                `${varietyData.requiredHours}`,
                span({ className: 'metric-unit' }, 'saat')
            )
        ),
        p({ className: 'variety-description' }, varietyData.description)
    );
}

function renderControlPanel(): HTMLElement {
    const provinceOptions = Object.keys(LOCATIONS).map(p => option({ value: p, selected: p === state.selectedProvince }, p));
    const districtOptions = Object.keys(LOCATIONS[state.selectedProvince]).map(d => option({ value: d, selected: d === state.selectedDistrict }, d));
    const varietyOptions = Object.keys(CHERRY_VARIETIES).map(v => option({ value: v, selected: v === state.selectedVariety }, v));

    const tabs: { id: AppState['activeControlTab']; name: string }[] = [
        { id: 'alerts', name: 'Uyarılar' },
        { id: 'dataSource', name: 'Veri Kaynağı' },
        { id: 'advanced', name: 'Gelişmiş' },
        { id: 'temperatureTrends', name: 'Trendler' },
    ];

    return div({ className: 'card control-panel' },
        h2({ className: 'card-header' }, 'Kontrol Paneli'),
        div({ className: 'controls-container' },
            div({ className: 'control-group' },
                label({ htmlFor: 'province-select' }, 'İl'),
                select({ id: 'province-select', onchange: handleProvinceChange }, ...provinceOptions)
            ),
            div({ className: 'control-group' },
                label({ htmlFor: 'district-select' }, 'İlçe'),
                select({ id: 'district-select', onchange: handleDistrictChange }, ...districtOptions)
            ),
            div({ className: 'control-group' },
                label({ htmlFor: 'variety-select' }, 'Kiraz Çeşidi'),
                select({ id: 'variety-select', onchange: handleVarietyChange }, ...varietyOptions)
            )
        ),
        div({ className: 'tab-nav' },
            ...tabs.map(tab => button(
                {
                    className: `tab-button ${state.activeControlTab === tab.id ? 'active' : ''}`,
                    onclick: () => {
                        state.activeControlTab = tab.id;
                        rerenderApp();
                    }
                },
                tab.name
            ))
        ),
        div({ className: 'tab-content' },
            div({ className: `tab-pane ${state.activeControlTab === 'alerts' ? 'active' : ''}` },
                 div({className: 'alert-settings-group'},
                    div({className: 'alert-settings-header'},
                        h4({}, 'SMS ile Don Uyarısı'),
                        label({className: 'toggle-switch'},
                             input({ type: 'checkbox', checked: state.isSmsAlertsEnabled, onchange: handleSmsAlertsToggle }),
                             span({className: 'slider'})
                        )
                    ),
                    p({ className: 'prompt-description'}, 'Hava sıcaklığı donma noktasının altına düştüğünde telefonunuza uyarı gönderin.'),
                    div({ className: `phone-input-container ${state.isSmsAlertsEnabled ? 'visible' : ''}`},
                        div({className: 'control-group'},
                            label({htmlFor: 'phone-input'}, 'Telefon Numarası'),
                            input({
                                id: 'phone-input',
                                type: 'tel',
                                placeholder: 'Örn: 5551234567',
                                value: state.phoneNumber,
                                oninput: handlePhoneNumberChange,
                                disabled: !state.isSmsAlertsEnabled
                            })
                        )
                    ),
                     div({className: 'alert-disclaimer'},
                         h('strong', null, 'Gelecek Özellik: '),
                         'Bu fonksiyon şu anda geliştirme aşamasındadır ve aktif değildir. Gerçek SMS gönderimi yapılmamaktadır.'
                     )
                ),
                div({className: 'alert-settings-group'},
                    div({className: 'alert-settings-header'},
                        h4({}, 'E-posta ile Don Uyarısı'),
                        label({className: 'toggle-switch'},
                             input({ type: 'checkbox', checked: state.isEmailAlertsEnabled, onchange: handleEmailAlertsToggle }),
                             span({className: 'slider'})
                        )
                    ),
                    p({ className: 'prompt-description'}, 'Hava sıcaklığı donma noktasının altına düştüğünde e-posta adresinize uyarı gönderin.'),
                    div({ className: `email-input-container ${state.isEmailAlertsEnabled ? 'visible' : ''}`},
                        div({className: 'control-group'},
                            label({htmlFor: 'email-input'}, 'E-posta Adresi'),
                            input({
                                id: 'email-input',
                                type: 'email',
                                placeholder: 'ornek@eposta.com',
                                value: state.emailAddress,
                                oninput: handleEmailAddressChange,
                                disabled: !state.isEmailAlertsEnabled
                            })
                        )
                    ),
                     div({className: 'alert-disclaimer'},
                         h('strong', null, 'Gelecek Özellik: '),
                         'Bu fonksiyon şu anda geliştirme aşamasındadır ve aktif değildir. Gerçek e-posta gönderimi yapılmamaktadır.'
                     )
                )
            ),
            div({ className: `tab-pane ${state.activeControlTab === 'dataSource' ? 'active' : ''}`},
                 div({className: 'alert-settings-group data-source-group'},
                    h4({}, 'Veri Sağlayıcı'),
                    p({ className: 'prompt-description'}, 'Analiz için kullanılacak hava durumu veri kaynağını seçin.'),
                    div({className: 'radio-group'},
                         div({className: 'radio-option'},
                             input({
                                 type: 'radio',
                                 id: 'source-open-meteo',
                                 name: 'dataSource',
                                 value: 'open-meteo',
                                 checked: state.dataSource === 'open-meteo',
                                 onchange: handleDataSourceChange
                             }),
                             label({ htmlFor: 'source-open-meteo' }, 'Open-Meteo (Standart)')
                         ),
                         div({className: 'radio-option'},
                             input({
                                 type: 'radio',
                                 id: 'source-gemini',
                                 name: 'dataSource',
                                 value: 'gemini',
                                 checked: state.dataSource === 'gemini',
                                 onchange: handleDataSourceChange,
                                 disabled: true // Disable Gemini for now as it's not a reliable data source for historical weather
                             }),
                             label({ htmlFor: 'source-gemini' }, 'Google Gemini (Devre Dışı)')
                         )
                    )
                 ),
                 div({className: 'alert-settings-group'},
                    div({className: 'alert-settings-header'},
                        h4({}, 'Otomatik Güncelleme'),
                        label({className: 'toggle-switch'},
                             input({ type: 'checkbox', checked: state.isAutoRefreshEnabled, onchange: handleAutoRefreshToggle }),
                             span({className: 'slider'})
                        )
                    ),
                    p({ className: 'prompt-description'}, 'Verileri her 30 dakikada bir otomatik olarak yeniler.')
                )
            ),
            div({ className: `tab-pane ${state.activeControlTab === 'advanced' ? 'active' : ''}` },
                div({ className: 'control-group' },
                    label({ htmlFor: 'start-date-input' }, 'Başlangıç Tarihi'),
                    input({
                        id: 'start-date-input',
                        type: 'date',
                        value: state.startDate,
                        onchange: handleStartDateChange
                    })
                ),
                div({ className: 'control-group' },
                    label({ htmlFor: 'end-date-input' }, 'Bitiş Tarihi'),
                    input({
                        id: 'end-date-input',
                        type: 'date',
                        value: state.endDate,
                        onchange: handleEndDateChange
                    })
                ),
                div({ className: 'control-group' },
                    label({ htmlFor: 'threshold-input' }, 'Soğuklama Eşiği (°C)'),
                    input({
                        id: 'threshold-input',
                        type: 'number',
                        step: 0.1,
                        value: state.chillingThreshold,
                        oninput: handleThresholdChange
                    })
                )
            ),
            div({ className: `tab-pane ${state.activeControlTab === 'temperatureTrends' ? 'active' : ''}` },
                div({ className: 'trend-controls-container' },
                    p({ className: 'prompt-description' }, 'Görüntülemek istediğiniz sıcaklık trendi analizini seçin.'),
                    button({ className: 'trend-button', onclick: () => handleTrendButtonClick('daily') }, 'Günlük Sıcaklık Trendleri'),
                    button({ className: 'trend-button', onclick: () => handleTrendButtonClick('monthly') }, 'Aylık Soğuklama Dağılımı'),
                    button({ className: 'trend-button', onclick: () => handleTrendButtonClick('yearly') }, 'Yıllık Karşılaştırma')
                ),
                state.activeTrendChart !== 'none' ? renderTrendChart() : null
            )
        ),
        div({className: 'panel-footer'},
             button({
                 id: 'main-analyze-button',
                 disabled: state.isLoading,
                 onclick: () => fetchAndProcessWeatherData({ isManual: true })
             }, state.isLoading ? div({className: 'button-loader'}) : 'Analiz Et')
        )
    );
}

function renderLoaderCard() {
    return div({ className: 'card' },
        div({ className: 'loader-container' },
            div({ className: 'loader' }),
            p(null, 'Veriler alınıyor ve işleniyor...')
        )
    );
}

function renderErrorCard(message: string) {
    return div({ className: 'card error-card' }, p(null, message));
}

function renderResultsSummary(): HTMLElement {
    const totalHours = state.totalChillingHours ?? 0;
    const requiredHours = CHERRY_VARIETIES[state.selectedVariety]?.requiredHours ?? 1;
    const progress = Math.min((totalHours / requiredHours) * 100, 100);
    const isComplete = progress >= 100;

    return div({ className: 'card' },
        div({ className: 'results-summary' },
            div({ className: 'summary-card' },
                h3({}, 'Toplam Soğuklama'),
                div({ className: 'metric-value' },
                    // FIX: Convert number to string to satisfy TypeScript compiler for the children of an element.
                    totalHours.toString(),
                    span({ className: 'metric-unit' }, 'saat')
                ),
            ),
            div({ className: 'summary-card' },
                h3({}, 'Gereken / Tamamlanan'),
                div({ className: 'metric-value' },
                    `${Math.round(progress)}`,
                    span({ className: 'metric-unit' }, '%')
                ),
                div({ className: 'progress-bar-container' },
                    div({ className: `progress-bar ${isComplete ? 'complete' : ''}`, style: `width: ${progress}%` })
                )
            )
        )
    );
}

function renderAiRecommendationCard(): HTMLElement | null {
    if (!state.isRecommendationLoading && !state.aiRecommendation) {
        return null; // Don't render anything if there's nothing to show
    }

    let content: HTMLElement;

    if (state.isRecommendationLoading) {
        content = div({ className: 'recommendation-loader' },
            p(null, 'Yapay zeka sizin için verileri analiz ediyor...'),
            div({ className: 'loader-dots' },
                div(null),
                div(null),
                div(null)
            )
        );
    } else {
        // Use a div and set white-space in CSS for easy formatting
        content = div({ className: 'ai-recommendation-text' }, state.aiRecommendation);
    }

    return div({ className: 'card ai-recommendation-card' },
        h3({ },
            // Sparkle SVG Icon
            h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: 'btn-icon'}, 
                h('path', { d: "M10 3L8 8l-5 2 5 2 2 5 2-5 5-2-5-2zM16 13l-1.5 3L13 17.5l1.5 1.5 1.5 3 1.5-3L19 17.5l-1.5-1.5z" })
            ),
           'Yapay Zeka Analizi'
        ),
        content
    );
}


function renderDailyTemperatureChart(): HTMLElement {
    setTimeout(() => {
        const ctx = (document.getElementById('daily-temp-chart') as HTMLCanvasElement)?.getContext('2d');
        if (!ctx || !state.dailyTemperatures) return;

        if (temperatureChart) {
            temperatureChart.destroy();
        }
        
        const filteredData = state.dailyTemperatures.filter(d => 
            d.date >= state.chartStartDate && d.date <= state.chartEndDate
        );

        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredData.map(d => new Date(d.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })),
                datasets: [
                    {
                        label: 'Maksimum Sıcaklık',
                        data: filteredData.map(d => d.max),
                        borderColor: '#ff6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.3,
                    },
                    {
                        label: 'Minimum Sıcaklık',
                        data: filteredData.map(d => d.min),
                        borderColor: '#36a2eb',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.3,
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 0);

    return div({ id: 'daily-chart-section', className: 'card' },
        div({ className: 'card-header' }, h2({}, 'Günlük Sıcaklık Değişimi')),
        div({ className: 'line-chart-card' },
            h('canvas', { id: 'daily-temp-chart' })
        )
    );
}

function renderMonthlyChillingChart(): HTMLElement {
    setTimeout(() => {
        const ctx = (document.getElementById('monthly-chilling-chart') as HTMLCanvasElement)?.getContext('2d');
        if (!ctx || !state.monthlyChillingHours) return;

        if (monthlyChillingChart) {
            monthlyChillingChart.destroy();
        }
        
        monthlyChillingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(state.monthlyChillingHours),
                datasets: [{
                    label: 'Soğuklama Saati',
                    data: Object.values(state.monthlyChillingHours),
                    backgroundColor: 'rgba(0, 242, 169, 0.5)',
                    borderColor: 'rgba(0, 242, 169, 1)',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
        });
    }, 0);

    return div({ id: 'monthly-chart-section', className: 'card' },
        div({ className: 'card-header' }, h2({}, 'Aylık Soğuklama Dağılımı')),
        div({ className: 'bar-chart-card' },
            h('canvas', { id: 'monthly-chilling-chart' })
        )
    );
}

function renderDailyDetailsTable(): HTMLElement {
    if (!state.dailyTemperatures) return div(null);

    const tableRows = state.dailyTemperatures.map(day =>
        h('tr', null,
            h('td', { 'data-label': 'Tarih' }, new Date(day.date).toLocaleDateString('tr-TR')),
            h('td', { 'data-label': 'Min Sıcaklık' }, `${day.min.toFixed(1)}°C`),
            h('td', { 'data-label': 'Maks Sıcaklık' }, `${day.max.toFixed(1)}°C`)
        )
    );

    return div({ id: 'daily-details-section', className: 'card' },
        div({ className: 'card-header' }, h2({}, 'Günlük Detaylar')),
        div({ className: 'temp-table-container' },
            h('table', { className: 'temp-table' },
                h('thead', null,
                    h('tr', null,
                        h('th', null, 'Tarih'),
                        h('th', null, 'Min Sıcaklık'),
                        h('th', null, 'Maks Sıcaklık')
                    )
                ),
                h('tbody', null, ...tableRows)
            )
        )
    );
}

function renderTrendChart(): HTMLElement {
    if (state.isTrendLoading) {
        return div({ className: 'loader-container' },
            div({ className: 'loader' }),
            p(null, 'Trend verileri yükleniyor...')
        );
    }
    if (state.trendChartError) {
        return renderErrorCard(state.trendChartError);
    }
    if (!state.trendChartData) {
        return div(null); // Nothing to show yet
    }
    
    setTimeout(() => {
        const ctx = (document.getElementById('trend-chart') as HTMLCanvasElement)?.getContext('2d');
        if (!ctx) return;
        if (trendChart) trendChart.destroy();
        
        let chartConfig: any = {};

        if (state.activeTrendChart === 'yearly' && state.trendChartData.yearly) {
            chartConfig = {
                type: 'bar',
                data: {
                    labels: Object.keys(state.trendChartData.yearly),
                    datasets: [{
                        label: 'Yıllık Toplam Soğuklama (saat)',
                        data: Object.values(state.trendChartData.yearly),
                         backgroundColor: 'rgba(0, 201, 255, 0.5)',
                         borderColor: 'rgba(0, 201, 255, 1)',
                         borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            };
        }
        // Daily and Monthly trends will be shown in the main dashboard area now,
        // but this function can be extended to show them here too if needed.

        trendChart = new Chart(ctx, chartConfig);

    }, 0);

    return div({ className: 'chart-card', style: 'margin-top: 1rem;' },
        h4(null, 'Yıllık Soğuklama Karşılaştırması'),
        div({ className: 'bar-chart-card', style: 'height: 300px;' },
            h('canvas', { id: 'trend-chart' })
        )
    );
}


// --- EVENT HANDLERS ---
function handleProvinceChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    state.selectedProvince = target.value;
    state.selectedDistrict = Object.keys(LOCATIONS[state.selectedProvince])[0];
    rerenderApp();
}

function handleDistrictChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    state.selectedDistrict = target.value;
    rerenderApp();
}

function handleVarietyChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    state.selectedVariety = target.value;
    rerenderApp();
}

function handleDataSourceChange(e: Event) {
    const target = e.target as HTMLInputElement;
    state.dataSource = target.value as 'open-meteo' | 'gemini';
    rerenderApp();
}

function handleSmsAlertsToggle(e: Event) {
    const target = e.target as HTMLInputElement;
    state.isSmsAlertsEnabled = target.checked;
    if (!state.isSmsAlertsEnabled) {
        state.phoneNumber = ''; // Clear phone number when disabled
    }
    rerenderApp();
}

function handlePhoneNumberChange(e: Event) {
    const target = e.target as HTMLInputElement;
    state.phoneNumber = target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    rerenderApp();
}

function handleEmailAlertsToggle(e: Event) {
    const target = e.target as HTMLInputElement;
    state.isEmailAlertsEnabled = target.checked;
    if (!state.isEmailAlertsEnabled) {
        state.emailAddress = ''; // Clear email address when disabled
    }
    rerenderApp();
}

function handleEmailAddressChange(e: Event) {
    const target = e.target as HTMLInputElement;
    state.emailAddress = target.value;
    rerenderApp();
}

function handleAutoRefreshToggle(e: Event) {
    const target = e.target as HTMLInputElement;
    state.isAutoRefreshEnabled = target.checked;
    if (state.isAutoRefreshEnabled) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
    rerenderApp();
}

function handleStartDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    state.startDate = target.value;
    rerenderApp();
}

function handleEndDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    state.endDate = target.value;
    rerenderApp();
}

function handleThresholdChange(e: Event) {
    const target = e.target as HTMLInputElement;
    state.chillingThreshold = parseFloat(target.value) || 7.2;
    rerenderApp();
}

async function handleTrendButtonClick(trend: 'daily' | 'monthly' | 'yearly') {
    state.activeTrendChart = trend;

    if (trend === 'daily' || trend === 'monthly') {
        // Clear any error message specific to the trend tab
        state.trendChartError = null;
        rerenderApp();

        // If analysis hasn't been run yet, run it now.
        if (state.totalChillingHours === null) {
            await fetchAndProcessWeatherData({ isManual: true });

            // If the analysis failed, the main dashboard will show an error. We stop here.
            if (state.totalChillingHours === null) {
                return;
            }
        }
        
        // The corresponding chart is on the main dashboard. Scroll to it.
        const elementId = trend === 'daily' ? 'daily-chart-section' : 'monthly-chart-section';
        
        // Use a small timeout to ensure the element is rendered, especially after a fresh analysis.
        setTimeout(() => {
            document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
    }

    // Handle the 'yearly' trend, which is displayed within the tab itself.
    state.isTrendLoading = true;
    state.trendChartError = null;
    state.trendChartData = null;
    rerenderApp();

    try {
        const comparisonData = await fetchYearlyComparisonData();
        if (Object.keys(comparisonData).length === 0) {
             throw new Error("Karşılaştırma verisi alınamadı.");
        }
        state.trendChartData = { yearly: comparisonData };
    } catch (err: any) {
        state.trendChartError = err.message;
    } finally {
        state.isTrendLoading = false;
        rerenderApp();
    }
}


// --- APP ---
function App() {
    return div(null,
        h('header', null,
            h1(null, 'Bitki Soğuklama Takip'),
            p(null, 'Meyve ağaçlarınızın soğuklama ihtiyacını takip edin ve tarımsal verimliliğinizi artırın.')
        ),
        div({ className: 'main-container' },
            div({ className: 'dashboard-left' },
                renderControlPanel(),
                renderVarietyInfoCard()
            ),
            div({ className: 'dashboard-right' },
                (state.totalChillingHours === null && !state.isLoading && !state.error) ?
                div({ className: 'card' },
                    h2({ className: 'card-header' }, 'Sonuçlar'),
                    div({ className: 'placeholder' },
                        p(null, 'Analiz sonuçları burada gösterilecektir. Başlamak için soldaki panelden seçim yapıp "Analiz Et" butonuna tıklayın.')
                    )
                ) :
                div({ style: 'display: flex; flex-direction: column; gap: 1.5rem;' }, 
                    state.isLoading ? renderLoaderCard() : null,
                    state.error ? renderErrorCard(state.error) : null,
                    state.totalChillingHours !== null ? renderResultsSummary() : null,
                    renderAiRecommendationCard(),
                    state.dailyTemperatures ? renderDailyTemperatureChart() : null,
                    state.monthlyChillingHours ? renderMonthlyChillingChart() : null,
                    state.dailyTemperatures ? renderDailyDetailsTable() : null
                )
            )
        )
    );
}

function rerenderApp() {
    const root = document.getElementById('root');
    if (root) {
        const scrollTop = root.scrollTop;
        root.innerHTML = '';
        root.appendChild(App());
        root.scrollTop = scrollTop;
    }
}

// Initial Render
document.addEventListener('DOMContentLoaded', rerenderApp);