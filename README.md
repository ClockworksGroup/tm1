# Transport Master 🚇

A **comprehensive public transportation management tycoon game** with realistic simulation mechanics, built with React, Three.js, and TypeScript.

## 🎮 Game Features

### Core Gameplay
Build and manage a complete public transportation network with **metro, train, tram, and bus lines**. Balance finances, passenger satisfaction, and operational efficiency while your city grows.

### Advanced Simulation

#### 🚇 **Metro System**
- **Multi-depth stations**: Surface, shallow (15m), medium (30m), deep (50m)
- **Construction costs** scale with depth (1x to 4x multiplier)
- **Building foundation constraints**: Can't build through skyscraper foundations
- **Tunnel routing**: Free-form placement with gradient limits (max 4%)
- **Underground visualization**: Toggle underground view to see metro network

#### 🚌 **Bus System**
- **Street direction compliance**: Buses follow one-way streets
- **Traffic impact**: Congestion reduces speed (50% during rush hour)
- **Bus lanes**: Dedicated lanes improve reliability
- **Flexible routing**: Lower construction costs, tighter curves

#### 🚊 **Tram System**
- **Street-running**: Shares road space or dedicated right-of-way
- **Overhead wire infrastructure**: Additional installation costs
- **Medium capacity**: Balance between bus and metro
- **Tight curves**: Can navigate city streets better than trains

#### 🚂 **Train System**
- **Commuter rail**: High-speed regional connectivity
- **Platform requirements**: Longer platforms for train sets
- **Electrification options**: Third rail vs overhead catenary
- **Express service**: Skip stations during rush hour

### ⏰ Time-Based Dynamics

#### **Rush Hour System**
- **Morning rush** (7-9 AM): 3x passenger demand
- **Evening rush** (5-7 PM): 3x passenger demand
- **Midday** (9 AM-5 PM): 1.2x demand
- **Night service** (11 PM-5 AM): 0.3x demand
- **Weekend patterns**: Different demand distribution

#### **Dynamic Scheduling**
- **Adjust frequency** by time of day (1-30 min headways)
- **Rush hour frequency**: Separate setting for peak periods
- **Operating hours**: Set service start/end times per line
- **Optimization tool**: AI suggests optimal frequencies

### 😊 Passenger Satisfaction System

**8 Satisfaction Factors** (weighted):
1. **Wait time** (20%): Frequency of service
2. **Travel time** (15%): Speed + transfers
3. **Crowding** (15%): Load factor vs capacity
4. **Reliability** (15%): On-time performance
5. **Coverage** (10%): Distance to nearest station
6. **Cleanliness** (10%): Maintenance investment
7. **Safety** (10%): Lighting, security
8. **Accessibility** (5%): Elevators, ramps

**Overall satisfaction** affects government subsidies (30% bonus if >70%)

### 💰 Advanced Economics

#### **Revenue Streams**
- **Fare revenue**: Base fare + peak surcharge
- **Advertising**: $500/station/hour
- **Retail spaces**: Station upgrades generate income
- **Government subsidies**: Performance-based funding

#### **Cost Breakdown**
- **Operating costs**: Staff, energy, maintenance
- **Construction costs**: Varies by type and depth
- **Depreciation**: Vehicles age and lose value
- **Emergency repairs**: Random events

#### **Fare Structure**
- **Base fare**: $2.00 (adjustable)
- **Peak surcharge**: +$0.50 during rush hours
- **Transfer discount**: -$0.50 for connections
- **Monthly passes**: $100 (unlimited travel)

### 🏗️ Construction & Upgrades

#### **Construction Phases**
1. **Planning**: Environmental studies, permits
2. **Construction**: Progress tracking (0-100%)
3. **Testing**: Pre-opening trials
4. **Operational**: Full service

#### **Station Upgrades**
- **Elevator** ($500K): +20% accessibility
- **Escalator** ($300K): +10% accessibility
- **Retail space** ($200K): +$1,000/hr revenue
- **Additional platform** ($1M): +50% capacity

#### **Line Metrics**
- **Load factor**: Capacity utilization (target 75%)
- **Reliability**: On-time performance
- **Farebox recovery**: Revenue/cost ratio
- **Profitability**: Net income per hour

### 🗺️ Urban Planning

#### **District Types**
- **Residential**: High morning outbound demand
- **Commercial**: High evening inbound demand
- **Industrial**: Shift work patterns
- **Mixed-use**: Balanced demand

#### **District Metrics**
- **Population**: 50K-100K per district
- **Coverage**: % within 500m of station
- **Satisfaction**: District-specific happiness
- **Transit-oriented development**: Bonus near stations

### 📊 Analytics & Optimization

#### **Performance Metrics**
- **Passengers/day**: Total ridership
- **Average wait time**: System-wide
- **System reliability**: Network average
- **Coverage**: % population served

#### **Financial Tracking**
- **Revenue trends**: 30-day history
- **Cost breakdown**: By category
- **Net income**: Hourly and daily
- **Farebox recovery**: Sustainability metric

#### **AI Suggestions**
- **Bottleneck identification**: Overcrowded stations
- **Coverage gaps**: Underserved districts
- **Profitability warnings**: Unprofitable lines
- **Frequency optimization**: Automatic calculations

### 🎲 Random Events

**Event Types** (5% chance per hour):
- **Equipment failure**: Reliability -30%, repair costs
- **Severe weather**: Multiple lines affected
- **Labor strike**: Network-wide impact
- **Service accident**: Single line disruption
- **Vandalism**: Maintenance costs increase

**Event Choices**:
- **Emergency repair**: Fast, expensive
- **Standard repair**: Slower, cheaper
- **Delay repair**: Risky, free

### 🎨 Visual Features

#### **View Layers** (Toggle on/off)
- **Underground view**: See metro tunnels and depths
- **Demand heatmap**: Passenger demand visualization
- **Satisfaction heatmap**: District happiness
- **Elevation view**: Terrain and gradients
- **Noise zones**: Environmental impact

#### **3D Visualization**
- **Buildings**: Procedurally generated from OSM data
- **Roads**: One-way streets, traffic levels
- **Stations**: Color-coded by type
- **Lines**: Animated routes with depth
- **Districts**: Boundary visualization

## 🎯 Game Objectives

### **Financial Goals**
- Maintain positive cash flow
- Achieve 50%+ farebox recovery
- Build $10M+ balance

### **Service Goals**
- 70%+ overall satisfaction
- 80%+ system coverage
- 90%+ reliability

### **Network Goals**
- Connect all districts
- Serve 100K+ passengers/day
- Build 10+ operational lines

## 🎨 UI Design

**Ultra-minimal aesthetic**:
- **Glassmorphism**: Subtle backdrop blur, low opacity
- **Monochromatic**: Black/white with opacity variations
- **Typography**: Light weights, wide tracking, uppercase labels
- **No bright colors**: Professional, clean interface
- **Subtle interactions**: Opacity changes, minimal animations

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Three.js** + React Three Fiber (3D rendering)
- **Zustand** (state management)
- **TailwindCSS** (styling)
- **Vite** (build tool)
- **Lucide React** (icons)

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open `http://localhost:3000`

### Build
```bash
npm run build
npm run preview
```

## 🎮 How to Play

### 1. **Select a City**
Choose from preset cities: New York, London, Paris, Tokyo, Berlin, Barcelona

### 2. **Build Your Network**
- Select transport type (metro/train/tram/bus)
- Click map to place stations
- Consider depth for metro (avoid foundations)
- Connect stations to create lines

### 3. **Manage Operations**
- Adjust frequency for each line
- Set rush hour schedules
- Monitor load factors
- Upgrade overcrowded stations

### 4. **Optimize Finances**
- Balance revenue and costs
- Invest in high-demand areas
- Close unprofitable lines
- Upgrade stations for retail revenue

### 5. **Respond to Events**
- Handle equipment failures
- Manage strikes and accidents
- Choose repair strategies
- Maintain reliability

### 6. **Follow Suggestions**
- AI identifies bottlenecks
- Coverage gap recommendations
- Frequency optimization
- Profitability warnings

## 📈 Game Balance

### **Starting Conditions**
- **Budget**: $10,000,000
- **Date**: January 1, 2024, 7:00 AM
- **Districts**: 4 (varied types)
- **Population**: 200K-400K total

### **Construction Costs**
- **Metro**: $50M/km + station costs
- **Train**: $30M/km
- **Tram**: $10M/km
- **Bus**: $500K/route

### **Operating Costs** (per hour)
- **Metro**: $500/station
- **Train**: $400/station
- **Tram**: $200/station
- **Bus**: $100/stop

### **Ticket Prices**
- **Metro**: $2.50
- **Train**: $3.00
- **Tram**: $2.00
- **Bus**: $1.50

## 🎓 Tips & Strategies

### **Early Game**
1. Start with **bus lines** (cheap, flexible)
2. Connect **residential to commercial** districts
3. Focus on **coverage** over capacity
4. Build during **off-peak** to save money

### **Mid Game**
1. Upgrade to **tram lines** in high-demand corridors
2. Add **metro** for dense urban areas
3. Implement **rush hour frequencies**
4. Upgrade stations with **elevators**

### **Late Game**
1. Build **regional train** network
2. Optimize **all frequencies**
3. Add **retail spaces** for passive income
4. Achieve **70%+ satisfaction** for subsidies

### **Pro Tips**
- **Metro depth**: Deeper = more expensive but avoids foundations
- **Bus lanes**: Dramatically improve reliability
- **Rush hour**: 3x demand = 3x revenue opportunity
- **Load factor**: Target 75% for optimal balance
- **Subsidies**: 30% bonus if satisfaction >70%
- **Events**: Emergency repairs prevent satisfaction loss

## 🐛 Known Limitations

- OSM data is currently mocked (real integration pending)
- Vehicle animations not yet implemented
- Passenger flow visualization planned
- Multiplayer/leaderboards coming soon
- Tutorial system in development

## 📝 Future Features

- **Real OSM integration**: Live city data via Overpass API
- **Scenario mode**: Challenges and objectives
- **Sandbox mode**: Unlimited budget
- **Modding support**: Custom cities and vehicles
- **Multiplayer**: Compete on same city
- **Advanced AI**: Machine learning for optimization

## 🤝 Contributing

This is a beta release. Feedback welcome!

## 📄 License

MIT License - See LICENSE file

---

**Transport Master** - Build the transit network your city deserves.
