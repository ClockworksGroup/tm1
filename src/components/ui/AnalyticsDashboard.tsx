import { useState } from 'react'
import { Users, DollarSign, Target, Briefcase, Building2, Zap, AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

type Tab = 'overview' | 'financial' | 'operations' | 'competition' | 'staff' | 'assets'

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'operations', label: 'Operations', icon: Zap },
    { id: 'competition', label: 'Market', icon: Target },
    { id: 'staff', label: 'Staff', icon: Briefcase },
    { id: 'assets', label: 'Assets', icon: Building2 },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-normal transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#c90a43] text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'financial' && <FinancialTab />}
        {activeTab === 'operations' && <OperationsTab />}
        {activeTab === 'competition' && <CompetitionTab />}
        {activeTab === 'staff' && <StaffTab />}
        {activeTab === 'assets' && <AssetsTab />}
      </div>
    </div>
  )
}

// Helper Components
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#2a2a2a] rounded p-2">
      <div className="text-gray-500 text-[10px] mb-1">{label}</div>
      <div className="text-white text-sm font-normal">{value}</div>
    </div>
  )
}

function DataRow({ label, value, bold, positive, negative }: { 
  label: string; 
  value: string; 
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={`text-gray-500 ${bold ? 'font-normal' : ''}`}>{label}</span>
      <span className={`${bold ? 'font-normal' : ''} ${
        positive ? 'text-green-400' : negative ? 'text-red-400' : 'text-white'
      }`}>
        {value}
      </span>
    </div>
  )
}

// ===== OVERVIEW TAB =====
function OverviewTab() {
  const { analytics, satisfactionFactors, victoryConditions, lines, stations, vehicleTracking } = useGameStore()

  return (
    <div className="space-y-4">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Passengers/day" value={(analytics.totalPassengers * 24).toLocaleString()} />
        <MetricCard label="Lines" value={lines.length.toString()} />
        <MetricCard label="Stations" value={stations.length.toString()} />
        <MetricCard label="Vehicles" value={vehicleTracking.length.toString()} />
        <MetricCard label="Coverage" value={`${(analytics.systemCoverage * 100).toFixed(0)}%`} />
        <MetricCard label="Reliability" value={`${analytics.systemReliability.toFixed(0)}%`} />
      </div>

      {/* Victory Progress */}
      {victoryConditions.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Victory Progress</div>
          <div className="space-y-2">
            {victoryConditions.map(vc => (
              <div key={vc.condition}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{vc.name}</span>
                  <span className="text-white">{vc.progress.toFixed(0)}%</span>
                </div>
                <div className="bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${vc.achieved ? 'bg-green-500' : 'bg-[#c90a43]'}`}
                    style={{ width: `${Math.min(100, vc.progress)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Satisfaction */}
      <div className="border-t border-gray-800 pt-4">
        <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Satisfaction Breakdown</div>
        <div className="space-y-1.5">
          {Object.entries(satisfactionFactors).map(([key, value]) => {
            if (key === 'overall' || key === 'waitTime' || key === 'travelTime' || key === 'crowding') return null
            return (
              <div key={key} className="flex items-center space-x-2">
                <span className="text-gray-500 text-xs w-24 capitalize">{key}</span>
                <div className="flex-1 bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all"
                    style={{ width: `${typeof value === 'number' ? value : 0}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs w-8 text-right">
                  {typeof value === 'number' ? value.toFixed(0) : 0}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===== FINANCIAL TAB =====
function FinancialTab() {
  const { analytics, economics, lineProfitability, loans, creditRating, lines } = useGameStore()
  
  const totalDebt = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0)
  const monthlyDebtPayment = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)

  return (
    <div className="space-y-4">
      {/* Revenue & Costs */}
      <div>
        <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Income Statement (Daily)</div>
        <div className="space-y-2">
          <DataRow label="Fare Revenue" value={`$${(economics.fareRevenue * 24).toLocaleString()}`} />
          <DataRow label="Advertising" value={`$${(economics.advertisingRevenue * 24).toLocaleString()}`} />
          <DataRow label="Retail" value={`$${(economics.retailRevenue * 24).toLocaleString()}`} />
          <DataRow label="Subsidies" value={`$${(economics.subsidies * 24).toLocaleString()}`} />
          <div className="border-t border-gray-800 pt-2 mt-2">
            <DataRow label="Total Revenue" value={`$${(analytics.totalRevenue * 24).toLocaleString()}`} bold />
          </div>
          <div className="mt-3 space-y-2">
            <DataRow label="Operating Costs" value={`$${(economics.operatingCosts * 24).toLocaleString()}`} negative />
            <DataRow label="Maintenance" value={`$${(economics.maintenanceCosts * 24).toLocaleString()}`} negative />
            <DataRow label="Staff" value={`$${(economics.staffCosts * 24).toLocaleString()}`} negative />
            <DataRow label="Energy" value={`$${(economics.energyCosts * 24).toLocaleString()}`} negative />
          </div>
          <div className="border-t border-gray-800 pt-2 mt-2">
            <DataRow 
              label="Net Income" 
              value={`${analytics.netIncome >= 0 ? '+' : ''}$${(analytics.netIncome * 24).toLocaleString()}`}
              bold
              positive={analytics.netIncome >= 0}
              negative={analytics.netIncome < 0}
            />
          </div>
        </div>
      </div>

      {/* Line Profitability */}
      {lineProfitability.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Line Profitability (Hourly)</div>
          <div className="space-y-2">
            {lineProfitability.slice(0, 5).map(lp => {
              const line = lines.find(l => l.id === lp.lineId)
              return (
                <div key={lp.lineId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line?.color || '#666' }} />
                    <span className="text-gray-400">{line?.name || 'Line'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">{lp.margin.toFixed(0)}% margin</span>
                    <span className={lp.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {lp.profit >= 0 ? '+' : ''}${lp.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Debt & Credit */}
      <div className="border-t border-gray-800 pt-4">
        <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Debt & Credit</div>
        <div className="space-y-2">
          <DataRow label="Credit Rating" value={creditRating.rating} />
          <DataRow label="Credit Score" value={`${creditRating.score}/100`} />
          <DataRow label="Available Credit" value={`$${creditRating.availableCredit.toLocaleString()}`} />
          <DataRow label="Total Debt" value={`$${totalDebt.toLocaleString()}`} negative={totalDebt > 0} />
          <DataRow label="Monthly Payment" value={`$${monthlyDebtPayment.toLocaleString()}`} />
          <DataRow label="Active Loans" value={loans.length.toString()} />
        </div>
      </div>
    </div>
  )
}

// ===== OPERATIONS TAB =====
function OperationsTab() {
  const { analytics, bottlenecks, demandHeatmap, vehicleTracking } = useGameStore()
  
  const onTimeVehicles = vehicleTracking.filter(v => v.status === 'on_time').length
  const delayedVehicles = vehicleTracking.filter(v => v.status === 'delayed').length
  const breakdownVehicles = vehicleTracking.filter(v => v.status === 'breakdown').length

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div>
        <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Performance Metrics</div>
        <div className="space-y-2">
          <DataRow label="Avg Wait Time" value={`${analytics.averageWaitTime.toFixed(1)} min`} />
          <DataRow label="Avg Travel Time" value={`${analytics.averageTravelTime.toFixed(1)} min`} />
          <DataRow label="System Reliability" value={`${analytics.systemReliability.toFixed(0)}%`} />
          <DataRow label="Farebox Recovery" value={`${analytics.totalCosts > 0 ? ((analytics.totalRevenue / analytics.totalCosts) * 100).toFixed(0) : 0}%`} />
        </div>
      </div>

      {/* Vehicle Status */}
      {vehicleTracking.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Vehicle Status</div>
          <div className="space-y-2">
            <DataRow label="Total Vehicles" value={vehicleTracking.length.toString()} />
            <DataRow label="On Time" value={onTimeVehicles.toString()} positive />
            <DataRow label="Delayed" value={delayedVehicles.toString()} negative={delayedVehicles > 0} />
            <DataRow label="Breakdowns" value={breakdownVehicles.toString()} negative={breakdownVehicles > 0} />
            <DataRow label="Avg Load" value={`${(vehicleTracking.reduce((sum, v) => sum + (v.currentLoad / v.capacity), 0) / vehicleTracking.length * 100).toFixed(0)}%`} />
          </div>
        </div>
      )}

      {/* Demand Hotspots */}
      {demandHeatmap.hotspots.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Top Demand Routes</div>
          <div className="space-y-2">
            {demandHeatmap.hotspots.slice(0, 5).map((hotspot, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Route {i + 1}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">{hotspot.demand.toLocaleString()} pax/hr</span>
                  <span className={hotspot.satisfied > 0.7 ? 'text-green-400' : 'text-red-400'}>
                    {(hotspot.satisfied * 100).toFixed(0)}% served
                  </span>
                </div>
              </div>
            ))}
            <DataRow label="Unserved Demand" value={`${demandHeatmap.unservedDemand.toLocaleString()} pax/hr`} negative />
          </div>
        </div>
      )}

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <div className="text-gray-500 text-xs tracking-wide uppercase">Bottlenecks ({bottlenecks.length})</div>
          </div>
          <div className="space-y-2">
            {bottlenecks.slice(0, 3).map(b => (
              <div key={b.id} className="bg-[#2a2a2a] rounded p-2">
                <div className="text-xs text-white mb-1">{b.issue}</div>
                <div className="text-[10px] text-gray-500">
                  {b.impact.passengersAffected.toLocaleString()} affected • {b.impact.delayMinutes.toFixed(1)} min delay
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== COMPETITION TAB =====
function CompetitionTab() {
  const { competition, competitors, competitorActions } = useGameStore()
  
  const avgTransitShare = competition.length > 0 
    ? competition.reduce((sum, c) => sum + c.transitShare, 0) / competition.length 
    : 0

  return (
    <div className="space-y-4">
      {/* Market Share */}
      <div>
        <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Your Market Share</div>
        <div className="space-y-2">
          <DataRow label="Avg Transit Share" value={`${(avgTransitShare * 100).toFixed(1)}%`} />
          {competition.slice(0, 5).map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">District {i + 1}</span>
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">{(c.transitShare * 100).toFixed(0)}% transit</span>
                <span className="text-gray-500">{(c.carShare * 100).toFixed(0)}% car</span>
                <span className={`${
                  c.trend === 'improving' ? 'text-green-400' : 
                  c.trend === 'declining' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {c.trend === 'improving' ? '↑' : c.trend === 'declining' ? '↓' : '→'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitors */}
      {competitors.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Competitors</div>
          <div className="space-y-3">
            {competitors.map(comp => (
              <div key={comp.id} className="bg-[#2a2a2a] rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-normal">{comp.name}</span>
                  <span className="text-gray-500 text-[10px]">{comp.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <div className="text-gray-600">Market Share</div>
                    <div className="text-white">{(comp.marketShare * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Reputation</div>
                    <div className="text-white">{comp.reputation.toFixed(0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Lines</div>
                    <div className="text-white">{comp.lines.length}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Actions */}
      {competitorActions.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Recent Competitor Actions</div>
          <div className="space-y-2">
            {competitorActions.slice(0, 5).map((action, i) => (
              <div key={i} className="text-xs text-gray-400">
                {action.impact}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== STAFF TAB =====
function StaffTab() {
  const { unions, maintenanceRecords, passengerComplaints } = useGameStore()
  
  const avgCondition = maintenanceRecords.length > 0
    ? maintenanceRecords.reduce((sum, r) => sum + r.condition, 0) / maintenanceRecords.length
    : 100
  
  const totalDeferredMaintenance = maintenanceRecords.reduce((sum, r) => sum + r.deferredMaintenance, 0)

  return (
    <div className="space-y-4">
      {/* Union Status */}
      {unions.length > 0 && (
        <div>
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Union Status</div>
          {unions.map(union => (
            <div key={union.id} className="space-y-2">
              <DataRow label="Union" value={union.name} />
              <DataRow label="Members" value={union.memberCount.toLocaleString()} />
              <DataRow 
                label="Satisfaction" 
                value={`${union.satisfaction.toFixed(0)}%`}
                positive={union.satisfaction >= 70}
                negative={union.satisfaction < 50}
              />
              <DataRow 
                label="Strike Risk" 
                value={`${(union.strikeRisk * 100).toFixed(0)}%`}
                negative={union.strikeRisk > 0.3}
              />
              {union.demands.length > 0 && (
                <div className="mt-2">
                  <div className="text-gray-600 text-[10px] mb-1">Active Demands:</div>
                  {union.demands.map((demand, i) => (
                    <div key={i} className="text-xs text-gray-400 ml-2">
                      • {demand.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Maintenance */}
      {maintenanceRecords.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Asset Maintenance</div>
          <div className="space-y-2">
            <DataRow label="Assets Tracked" value={maintenanceRecords.length.toString()} />
            <DataRow 
              label="Avg Condition" 
              value={`${avgCondition.toFixed(0)}%`}
              positive={avgCondition >= 80}
              negative={avgCondition < 60}
            />
            <DataRow 
              label="Deferred Maintenance" 
              value={`$${totalDeferredMaintenance.toLocaleString()}`}
              negative={totalDeferredMaintenance > 0}
            />
            <DataRow 
              label="High Risk Assets" 
              value={maintenanceRecords.filter(r => r.breakdownRisk > 0.3).length.toString()}
              negative={maintenanceRecords.filter(r => r.breakdownRisk > 0.3).length > 0}
            />
          </div>
        </div>
      )}

      {/* Passenger Feedback */}
      {passengerComplaints.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Recent Feedback</div>
          <div className="space-y-2">
            {passengerComplaints.slice(0, 5).map(complaint => (
              <div key={complaint.id} className="flex items-start space-x-2 text-xs">
                <span className="text-lg">{complaint.icon}</span>
                <div className="flex-1">
                  <div className="text-gray-400">{complaint.message}</div>
                  <div className="text-gray-600 text-[10px] mt-0.5">{complaint.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== ASSETS TAB =====
function AssetsTab() {
  const { upgradePaths, lines, stations, maintenanceRecords } = useGameStore()
  
  const poorConditionAssets = maintenanceRecords.filter(r => r.condition < 60).length

  return (
    <div className="space-y-4">
      {/* Infrastructure Overview */}
      <div>
        <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Infrastructure</div>
        <div className="space-y-2">
          <DataRow label="Total Lines" value={lines.length.toString()} />
          <DataRow label="Total Stations" value={stations.length.toString()} />
          <DataRow label="Operational Lines" value={lines.filter(l => l.phase === 'operational').length.toString()} />
          <DataRow label="Under Construction" value={lines.filter(l => l.phase === 'construction').length.toString()} />
        </div>
      </div>

      {/* Upgrade Paths */}
      {upgradePaths.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Available Upgrades</div>
          <div className="space-y-3">
            {upgradePaths.slice(0, 5).map(up => {
              const line = lines.find(l => l.id === up.lineId)
              return (
                <div key={up.lineId} className="bg-[#2a2a2a] rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line?.color || '#666' }} />
                      <span className="text-white text-xs">{line?.name || 'Line'}</span>
                    </div>
                    <span className="text-gray-500 text-[10px]">{up.currentLevel}</span>
                  </div>
                  {up.availableUpgrades.length > 0 && (
                    <div className="text-[10px] text-gray-400">
                      Upgrade to {up.availableUpgrades[0].toLevel}: ${(up.availableUpgrades[0].cost / 1000000).toFixed(0)}M
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Asset Condition */}
      {maintenanceRecords.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">Asset Health</div>
          <div className="space-y-2">
            <DataRow label="Total Assets" value={maintenanceRecords.length.toString()} />
            <DataRow 
              label="Poor Condition" 
              value={poorConditionAssets.toString()}
              negative={poorConditionAssets > 0}
            />
            <DataRow 
              label="Needs Maintenance" 
              value={maintenanceRecords.filter(r => r.breakdownRisk > 0.2).length.toString()}
              negative={maintenanceRecords.filter(r => r.breakdownRisk > 0.2).length > 0}
            />
          </div>
        </div>
      )}
    </div>
  )
}