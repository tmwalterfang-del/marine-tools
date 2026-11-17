/* Formula methods and independently checked cases for main calculator working. */
window.MT_CALC_REFERENCES = Object.freeze({
  'air-draft': {
    basis: 'Remaining clearance is published clearance minus water level, air draft and margin in a shared datum.',
    range: 'Published clearance must be positive, air draft and margin nonnegative, and water level finite and signed.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand clearances within 0.005 metres.'
  },
  'anchor-swing': {
    basis: 'A straight chain forms a right triangle whose horizontal reach plus vessel length gives the approximate swing radius.',
    range: 'Chain length must reach the nonnegative depth, with positive vessel length; catenary and hawse height are excluded.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand reach within 0.05 metres and displayed radius within 0.5 metres.'
  },
  'battery-runtime': {
    basis: 'Usable energy is nominal energy times the state of charge window and efficiency, divided by load for runtime.',
    range: 'Energy and load must be positive, with minimum charge through current charge between 0 and 100 percent and efficiency above 0 through 100 percent.',
    tolerance: 'tests/main-calculator-engineering-working-20261117.cjs checks hand energy and runtime exports within 1e-10 absolute.'
  },
  'bearing-distance': {
    basis: 'Haversine distance and initial spherical bearing use radius 3440.065 nautical miles; separately labelled WGS84 results use Karney inverse and direct geodesics with a = 6378137 m, f = 1 / 298.257223563 and 1852 m per nautical mile.',
    range: 'Use valid latitude and longitude positions; courses at coincident, antipodal or polar endpoints may be ambiguous. WGS84 results require the GeographicLib library.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks an equatorial arc within 0.001 nautical miles and bearing within 0.005 degrees; tests/main-calculator-wgs84-20261117.cjs checks NGA equatorial and frozen Karney GeodTest distances within 0.001 m, azimuths within 1e-8 degrees and direct endpoints within 1e-9 degrees.'
  },
  'beaufort': {
    basis: 'The app assigns Beaufort force from its approximate knot threshold table.',
    range: 'Wind speed must be nonnegative; the highest band starts at 64 knots and has no upper cutoff.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks that 15 knots gives force 4 exactly.'
  },
  'bunkering-overview': {
    basis: 'Delivery masses are volume times density, with totals, volume weighted density and date based mean delivery intervals.',
    range: 'Use at least one dated delivery with nonnegative volume and positive density; weighted density is undefined at zero total volume.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand totals and averages within 1e-10 absolute and undefined density exactly.'
  },
  'chemical-dosing': {
    basis: 'Product volume is system volume times the entered dose rate after conversion from the selected dosing unit.',
    range: 'System volume and dose rate must be nonnegative, using one of the four supported volume dosing units.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand litre and millilitre exports within 1e-10 absolute.'
  },
  'closest-route-point': {
    basis: 'The minimum clamped point to segment distance uses a local projection with 60 nautical miles per latitude degree.',
    range: 'Use valid coordinates and at least two route waypoints for short local legs where the flat projection is suitable.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks a hand latitude offset within 0.01 nautical miles.'
  },
  'coordinate-conversion': {
    basis: 'Decimal degrees equal degrees plus minutes divided by 60, with hemisphere signs and rounded sexagesimal output.',
    range: 'Latitude is within 90 degrees and longitude within 180 degrees, with minutes from zero to below 60 and no datum conversion.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks hand decimal coordinates within 1e-6 degrees.'
  },
  'current-eta': {
    basis: 'Ground speed is speed through water plus signed along track current, and passage time is distance divided by ground speed.',
    range: 'Distance and speed through water must be nonnegative, with finite current and strictly positive resulting ground speed.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks hand ground speed and passage time within 0.005 in knots and hours.'
  },
  'daily-consumption': {
    basis: 'Consumption is an entered amount or reading difference, converted to volume and multiplied by density for mass.',
    range: 'Use a date, positive density and nonnegative consumption; nondecreasing readings are required and hourly rate needs positive running hours.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks hand volume within 1e-6 cubic metres and mass within 0.05 kilograms.'
  },
  'endurance-scenarios': {
    basis: 'Each endurance is remaining fuel after percentage reserve divided by the corresponding daily consumption.',
    range: 'Remaining fuel must be nonnegative, reserve from zero to below 100 percent, and every scenario consumption positive.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand usable fuel and endurance exports within 1e-10 absolute.'
  },
  'flow-fill-time': {
    basis: 'Constant flow relates transferred volume, flow rate and elapsed time by multiplication or division.',
    range: 'Active operands must be nonnegative and the divisor strictly positive when solving for time or flow.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks all three hand transfer modes within 1e-10 absolute in exports.'
  },
  'fuel-blend': {
    basis: 'Additive volumes give blend density from total mass, while sulphur percentage is weighted by component masses.',
    range: 'Volumes must be nonnegative with positive total volume, densities positive, and sulphur from 0 through 100 percent at a common temperature.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand density within 0.05 kilograms per cubic metre and sulphur within 0.0005 percentage points.'
  },
  'fuel-endurance': {
    basis: 'Usable fuel is remaining fuel less percentage reserve, and endurance is usable fuel divided by daily consumption.',
    range: 'Remaining fuel must be nonnegative, daily consumption positive, and reserve from 0 through 100 percent.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand fuel volumes and endurance within 0.05 in cubic metres and days.'
  },
  'fuel-volume-correction': {
    basis: 'Reference volume divides observed volume by the linear thermal expansion factor, while mass uses density at observed temperature.',
    range: 'Use nonnegative volume, positive density and a positive expansion factor within the supplied coefficient model; certified petroleum tables are excluded.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand reference volume and mass within 0.0005 in cubic metres and tonnes.'
  },
  'fwa-dwa': {
    basis: 'Fresh water allowance is displacement divided by four times TPC in millimetres, with dock water allowance interpolated between densities 1000 and 1025.',
    range: 'Displacement, TPC and density must be positive; dock water allowance is calculated only from 1000 through 1025 kilograms per cubic metre.',
    tolerance: 'tests/main-calculator-units-compass-density-20261117.cjs checks hand allowance exports within 1e-10 millimetres and unavailable results exactly.'
  },
  'generator-load-margin': {
    basis: 'Load percentage is load divided by online capacity, and remaining capacity is online capacity minus load.',
    range: 'Online capacity must be positive and load nonnegative; overload is reported as a negative margin.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand load percentages and margins within 1e-10 absolute in exports.'
  },
  'great-circle-rhumb': {
    basis: 'Spherical haversine and Mercator rhumb methods use radius 3440.065 nautical miles; separately labelled WGS84 results use Karney inverse geodesics with a = 6378137 m, f = 1 / 298.257223563 and 1852 m per nautical mile.',
    range: 'Use valid coordinates away from rhumb pole singularities; courses at coincident, antipodal or polar endpoints may be ambiguous. WGS84 results require the GeographicLib library.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks equatorial distances within 0.005 nautical miles and courses within 0.05 degrees; tests/main-calculator-wgs84-20261117.cjs checks NGA equatorial and frozen Karney GeodTest distances within 0.001 m and azimuths within 1e-8 degrees.'
  },
  'gyro-correction': {
    basis: 'True course is gyro course plus east positive gyro error, wrapped to one revolution.',
    range: 'Course and gyro error must be finite with a finite sum; magnetic corrections are excluded in gyro mode.',
    tolerance: 'tests/main-calculator-units-compass-density-20261117.cjs checks hand corrected course exports within 1e-12 degrees.'
  },
  'hydraulic-power': {
    basis: 'Hydraulic power is pressure difference times volume flow, with estimated input power divided by overall efficiency.',
    range: 'Pressure difference and flow must be nonnegative; input power mode requires efficiency above 0 through 100 percent.',
    tolerance: 'tests/main-calculator-engineering-working-20261117.cjs checks hand hydraulic and input power exports within 1e-10 kilowatts.'
  },
  'liquid-volume-mass': {
    basis: 'Mass is volume times density, with inverse conversion and fixed litre and tonne factors.',
    range: 'Amount must be nonnegative and density positive at the volume temperature; product presets are estimates.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand mass and volume exports within 1e-10 absolute.'
  },
  'lube-oil-trend': {
    basis: 'Oil additions after the baseline are divided by running hour increments for interval and overall consumption rates.',
    range: 'Use at least two dated readings with nonnegative hours and oil, and strictly increasing hours after date sorting; calendar rate needs elapsed days.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand oil rates within 1e-10 absolute in exports and undefined calendar rate exactly.'
  },
  'magnetic-compass': {
    basis: 'True course adds east positive variation and deviation to compass course, with optional linear annual variation change and revolution wrapping.',
    range: 'Course and corrections must be finite; optional epoch and calculation years must be integers from 1 through 9999 with a finite annual change.',
    tolerance: 'tests/main-calculator-units-compass-density-20261117.cjs checks hand course and variation exports within 1e-12 degrees.'
  },
  'motor-current': {
    basis: 'Balanced three phase motor current divides shaft power by efficiency, line voltage, power factor and the square root of three.',
    range: 'Output power must be nonnegative, line voltage positive, power factor above zero through one, and efficiency above 0 through 100 percent.',
    tolerance: 'tests/main-calculator-engineering-working-20261117.cjs checks hand running current exports within 1e-10 amperes.'
  },
  'nox-period': {
    basis: 'Source NOx is hours times power times a specific emission factor, or fuel mass times a fuel factor, summed separately from urea use.',
    range: 'Every source needs a name and nonnegative finite operands; tracked urea quantities and calculated use must be nonnegative.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand source NOx within 0.005 kilograms and displayed totals within 0.05 kilograms.'
  },
  'passage-scenarios': {
    basis: 'Daily fuel scales with the cube of scenario speed relative to reference speed and is multiplied by passage days.',
    range: 'Distance and reference consumption must be nonnegative, with positive reference speed and every scenario speed positive.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks a hand cubic fuel scenario within 0.01 cubic metres.'
  },
  'phase-current-imbalance': {
    basis: 'Current imbalance is the greatest absolute deviation from the three phase arithmetic mean divided by that mean.',
    range: 'Phase current magnitudes must be nonnegative with a positive mean; sequence components and voltage unbalance are excluded.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand means, deviations and imbalance exports within 1e-10 absolute.'
  },
  'pipe-velocity': {
    basis: 'Mean velocity is volume flow divided by the circular internal cross sectional area.',
    range: 'Flow must be nonnegative and internal diameter positive, assuming a full circular pipe.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand flow, area and velocity exports within 1e-10 absolute.'
  },
  'power-factor-correction': {
    basis: 'Required capacitor reactive power is active power times the difference between present and target reactive to active power ratios.',
    range: 'Active power must be nonnegative, with present power factor above zero and target greater than present through one for a lagging load.',
    tolerance: 'tests/main-calculator-engineering-working-20261117.cjs checks hand reactive power exports within 1e-10 kilovars.'
  },
  'pressure-head': {
    basis: 'Static pressure equals density times standard gravity 9.80665 times head, with conversion between pascals and bar.',
    range: 'Pressure or head must be nonnegative and density positive, assuming constant density and excluding flow losses.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand pressure and head exports within 1e-10 absolute.'
  },
  'pump-speed-change': {
    basis: 'Pump affinity estimates scale flow with speed ratio, head with its square and power with its cube.',
    range: 'Both speeds must be positive and baseline flow, head and power nonnegative for the same impeller and fluid at approximately constant efficiency.',
    tolerance: 'tests/main-calculator-engineering-working-20261117.cjs checks hand affinity law exports within 1e-10 absolute.'
  },
  'route-fuel': {
    basis: 'Route distance sums spherical waypoint legs, passage hours divide distance by service speed, and fuel is hours times daily consumption divided by 24.',
    range: 'Use a route with positive distance, valid coordinates, positive service speed and nonnegative daily consumption held constant throughout.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand route distance within 0.05 nautical miles and fuel within 0.005 cubic metres.'
  },
  'set-and-drift': {
    basis: 'Ground velocity is the vector sum of vessel velocity through water and current velocity directed towards the entered set.',
    range: 'Angles must be finite and both speeds nonnegative; course over ground is undefined when the resultant speed is zero.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks hand ground speed within 0.005 knots and course within 0.05 degrees.'
  },
  'speed-distance-time': {
    basis: 'Elapsed hours equal nautical mile distance divided by constant speed in knots.',
    range: 'Distance must be nonnegative and speed strictly positive.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks a hand passage time within 0.0005 hours.'
  },
  'speed-fuel-interpolation': {
    basis: 'Consumption is linearly interpolated between the two measured speed points bracketing the target.',
    range: 'Use at least two unique nonnegative speeds with nonnegative consumption and a target inside their closed speed range.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand endpoint and interior consumption exports within 1e-10 cubic metres per day.'
  },
  'tank-table-interpolation': {
    basis: 'Tank volume is linearly interpolated between two distinct sounding or ullage coordinates.',
    range: 'Coordinates must be finite and distinct, volumes nonnegative, and the measured coordinate between the two endpoints without extrapolation.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand interpolated volume exports within 1e-10 cubic metres.'
  },
  'tank-transfer': {
    basis: 'Final volume adds transferred volume to initial contents, fill divides by capacity, and time divides transferred volume by rate.',
    range: 'Capacity and rate must be positive, initial contents within capacity, and transfer nonnegative; final overfill is reported.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand volume and time within 0.005 in cubic metres and hours and fill within 0.05 percentage points.'
  },
  'three-phase-power': {
    basis: 'Balanced apparent power is the square root of three times line voltage and current, and active power multiplies by power factor.',
    range: 'Line voltage must be positive, current nonnegative and power factor above zero through one for a balanced sinusoidal load.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand apparent and active power exports within 1e-10 in kilovolt amperes and kilowatts.'
  },
  'transformer-current': {
    basis: 'Nominal balanced line current divides the common apparent power by line voltage and the square root of three on each side.',
    range: 'Apparent power and both line voltages must be positive; transformer losses, inrush and regulation are excluded.',
    tolerance: 'tests/main-calculator-round4-working-20261117.cjs checks hand primary and secondary current exports within 1e-10 amperes.'
  },
  'true-wind': {
    basis: 'True air velocity adds vessel velocity to the apparent wind velocity vector and reverses the resulting direction to report wind from.',
    range: 'Course and relative angle must be finite, speeds nonnegative, and relative wind angle clockwise from the bow; calm direction is undefined.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand true wind speed within 0.05 knots and direction within 0.5 degrees.'
  },
  'unit-converter': {
    basis: 'Selected conversions use fixed nautical mile, knot, bar, mechanical horsepower and metric horsepower factors or the Celsius Fahrenheit affine relation.',
    range: 'Use a finite signed value and one of the supported conversion pairs with a finite converted result.',
    tolerance: 'tests/main-calculator-units-compass-density-20261117.cjs checks hand conversions within case tolerances from 1e-14 to 1e-10 absolute.'
  },
  'voltage-drop': {
    basis: 'Resistive three phase drop is the square root of three times current, conductor resistance per kilometre and one way length.',
    range: 'Current, length and resistance must be nonnegative and voltage positive, assuming a balanced load at unity power factor without reactance.',
    tolerance: 'tests/main-calculator-engineering-working-20261117.cjs checks hand drop exports within 1e-10 volts and percentage points.'
  },
  'wave-encounter': {
    basis: 'Deep water dispersion and the vessel velocity component give encounter frequency, with absolute frequency floored at 0.00001 radians per second for period.',
    range: 'Use finite directions, nonnegative vessel speed and positive regular wave period in deep water; results near zero encounter frequency are sensitive.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks a hand following wave encounter period within 0.005 seconds.'
  },
  'weather-window': {
    basis: 'A weather window is a consecutive run of entered rows whose wave height, wind and current each meet inclusive limits.',
    range: 'Use complete timed rows and nonnegative finite forecast values and limits in entered order, without interpolation between times.',
    tolerance: 'tests/main-calculator-reference-20261117.cjs checks hand window counts, row membership and endpoint times exactly.'
  },
  'wind-components': {
    basis: 'Headwind and crosswind resolve the wind from vector using cosine and sine of wind direction relative to vessel course.',
    range: 'Directions must be finite and wind speed nonnegative, with positive headwind from ahead and positive crosswind from starboard.',
    tolerance: 'tests/main-calculator-working-browser-20261117.cjs checks hand headwind and crosswind components within 0.005 knots.'
  }
});
