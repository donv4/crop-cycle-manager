// frontend/src/app/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList, 
  Alert 
} from 'react-native';
import { apiService } from '../services/api';
import { useFarmSync } from '../hooks/useFarmSync';

// TypeScript interfaces
interface CropRow {
  id: number;
  farm_id: number;
  crop_type: string;
  planting_date: string;
  harvest_status: string; // 'planted', 'growing', 'harvesting', 'completed'
  days_to_maturity: number;
  companion_crop?: string;
  soil_notes?: string;
}

interface CropSuggestion {
  id: number;
  name: string;
  default_dtm: number;
  companion: string;
}

export default function StandaloneCropCycleApp() {
  const { logFarmActivity } = useFarmSync();
  
  // State management
  const [rows, setRows] = useState<CropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // Form state
  const [cropType, setCropType] = useState('');
  const [dtm, setDtm] = useState('75');
  const [companion, setCompanion] = useState('');
  const [soilNotes, setSoilNotes] = useState('');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<CropSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const TEST_FARM_ID = 101;

  // Load initial data
  useEffect(() => {
    fetchCropRows();
  }, []);

  // Debounced autocomplete lookup
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (cropType.trim().length >= 2) {
        triggerEncyclopediaLookup(cropType);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [cropType]);

  // Fetch crop rows from API
  const fetchCropRows = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCropRows(TEST_FARM_ID);
      if (response.success && response.data) {
        setRows(response.data);
      } else {
        // Local fallback for development
        setRows([
          { 
            id: 1, 
            farm_id: TEST_FARM_ID, 
            crop_type: "Bell Pepper (California Wonder)", 
            planting_date: "2026-08-20", 
            harvest_status: "growing", 
            days_to_maturity: 75, 
            companion_crop: "Basil, Onions, Marigolds", 
            soil_notes: "Beds conditioned with volcanic ash base layers" 
          },
          { 
            id: 2, 
            farm_id: TEST_FARM_ID, 
            crop_type: "Tomato (Heatmaster Commercial)", 
            planting_date: "2026-08-22", 
            harvest_status: "planted", 
            days_to_maturity: 70, 
            companion_crop: "Basil, Marigolds", 
            soil_notes: "Planted on sheltered hillside row frames" 
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching crop rows:', error);
      Alert.alert('Error', 'Failed to load crop data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Look up crop in encyclopedia
  const triggerEncyclopediaLookup = async (nameStr: string) => {
    try {
      const res = await apiService.request(
        `/api/crop/dictionary-lookup?name=${encodeURIComponent(nameStr)}`, 
        'GET'
      );
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setSuggestions(res.data);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Lookup error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle autocomplete selection with enhanced parsing
  const handleSelectSuggestion = (selectedItem: CropSuggestion) => {
    if (!selectedItem) return;
    
    setCropType(selectedItem.name);
    setDtm(selectedItem.default_dtm.toString());
    
    // Parse companion data with pipe delimiter
    if (selectedItem.companion && selectedItem.companion.includes('|')) {
      const parts = selectedItem.companion.split('|');
      setCompanion(parts[0] ? parts[0].trim() : '');
      let parsedNotes = '';
      if (parts[1]) parsedNotes += parts[1].trim();
      if (parts[2]) parsedNotes += '\n' + parts[2].trim();
      setSoilNotes(parsedNotes);
    } else {
      setCompanion(selectedItem.companion || '');
      setSoilNotes('');
    }
    
    setShowDropdown(false);
    setSuggestions([]);
    setSyncStatus(`✨ Auto-filled optimized details for ${selectedItem.name}!`);
  };

  // Calculate growth progress
  const calculateGrowthProgress = (plantingDateStr: string, totalDays: number): number => {
    try {
      const plantingDate = new Date(plantingDateStr);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - plantingDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.min(Math.round((diffDays / totalDays) * 100), 100);
    } catch (e) {
      return 0;
    }
  };

  // Calculate estimated harvest date
  const calculateHarvestDate = (plantingDateStr: string, daysToMaturity: number): string => {
    try {
      const pDate = new Date(plantingDateStr);
      pDate.setDate(pDate.getDate() + (daysToMaturity || 0));
      return pDate.toISOString().split('T')[0];
    } catch (e) {
      return 'Pending data';
    }
  };

  // Get crop category for styling
  const getCropCategory = (cropType: string): string => {
    const crop = cropType?.toLowerCase() || '';
    if (crop.includes('pepper') || crop.includes('tomato') || crop.includes('cabbage') || 
        crop.includes('bean') || crop.includes('onion') || crop.includes('potato') ||
        crop.includes('banana') || crop.includes('plantain') || crop.includes('dasheen')) {
      return 'vegetable';
    }
    return 'other';
  };

  // Plant new crop row with validation
  const handlePlantRow = async () => {
    if (!cropType.trim()) {
      Alert.alert('Required Field', 'Please enter or select a valid crop type');
      return;
    }

    const dtmValue = parseInt(dtm, 10);
    if (isNaN(dtmValue) || dtmValue < 1) {
      Alert.alert('Invalid DTM', 'Please enter a valid number of days to maturity');
      return;
    }

    setSyncStatus('🌱 Logging data to local queue entries...');
    const todayStr = new Date().toISOString().split('T')[0];

    const payload = {
      farm_id: TEST_FARM_ID,
      crop_type: cropType.trim(),
      planting_date: todayStr,
      harvest_status: 'planted',
      days_to_maturity: dtmValue,
      companion_crop: companion.trim() || null,
      soil_notes: soilNotes.trim() || null
    };

    try {
      const res = await logFarmActivity('/api/crop/plant', payload);
      if (res?.success) {
        setSyncStatus('✅ New cultivation row logged successfully!');
        setCropType('');
        setCompanion('');
        setSoilNotes('');
        await fetchCropRows();
      } else {
        setSyncStatus('⚠️ Failed to plant crop. Please try again.');
      }
    } catch (error) {
      setSyncStatus('⚠️ Network error. Please check your connection.');
      console.error('Plant error:', error);
    }
  };

  // Update crop status with optimistic UI
  const handleUpdateStatus = async (rowId: number, nextStatus: string) => {
    const originalRows = [...rows];
    
    // Optimistic update
    setRows(prev => prev.map(r => 
      r.id === rowId ? { ...r, harvest_status: nextStatus } : r
    ));
    setSyncStatus(`⏳ Updating row status to ${nextStatus}...`);

    try {
      const res = await apiService.request('/api/crop/update-status', 'POST', { 
        row_id: rowId, 
        harvest_status: nextStatus, 
        farm_id: TEST_FARM_ID 
      });
      
      if (!res.success) {
        setRows(originalRows);
        setSyncStatus('⚠️ Cloud update rejected. Reverted data states.');
      } else {
        setSyncStatus('✅ Row adjustments saved to the cloud!');
        await fetchCropRows();
      }
    } catch (error) {
      setRows(originalRows);
      setSyncStatus('⚠️ Sync queue active. Local layout preserved.');
      console.error('Update error:', error);
    }
  };

  // Remove crop row
  const handleRemoveRow = async (rowId: number) => {
    Alert.alert(
      "Remove Row", 
      "Are you sure you want to completely clear out this growing crop bed row?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            setSyncStatus('🗑️ Clearing cultivation row...');
            try {
              const res = await apiService.request('/api/crop/remove', 'POST', { 
                row_id: rowId, 
                farm_id: TEST_FARM_ID 
              });
              if (res.success) {
                setSyncStatus('✅ Row removed from cloud tables.');
                await fetchCropRows();
              } else {
                // Offline fallback
                setRows(prev => prev.filter(r => r.id !== rowId));
                setSyncStatus('⚠️ Row cleared locally.');
              }
            } catch (error) {
              setRows(prev => prev.filter(r => r.id !== rowId));
              setSyncStatus('⚠️ Row cleared locally. Sync will retry later.');
              console.error('Remove error:', error);
            }
          }
        }
      ]
    );
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planted': 
        return { bg: '#E8F5E9', text: '#2E7D32', label: '🌱 Planted' };
      case 'growing': 
        return { bg: '#E3F2FD', text: '#1565C0', label: '🌿 Growing' };
      case 'harvesting': 
        return { bg: '#FFF3E0', text: '#E65100', label: '🌾 Harvesting' };
      default: 
        return { bg: '#ECEFF1', text: '#37474F', label: '✅ Completed' };
    }
  };

  // Loading state
  if (loading && rows.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>🌿 Loading CropCycle Manager...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      <FlatList
        style={styles.container}
        data={rows}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : `crop-${index}`}
        
        ListHeaderComponent={
          <>
            <View style={styles.headerBlock}>
              <Text style={styles.titleHeader}>🌿 CropCycle Manager</Text>
              <Text style={styles.subtitleHeader}>
                Standalone Cultivation Map & Yield Tracking Portfolio
              </Text>
            </View>
            
            {syncStatus ? (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{syncStatus}</Text>
              </View>
            ) : null}
            
            <Text style={styles.sectionLabel}>🌾 Active Cultivation Beds</Text>
            
            {rows.length === 0 && (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>🌱 No crop beds planted yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Use the form below to start your cultivation journey!
                </Text>
              </View>
            )}
          </>
        }
        
        renderItem={({ item }) => {
          if (!item) return null;
          
          const isExpanded = expandedRowId === item.id;
          const statusConfig = getStatusConfig(item.harvest_status);
          const progress = calculateGrowthProgress(item.planting_date, item.days_to_maturity);
          const harvestDate = calculateHarvestDate(item.planting_date, item.days_to_maturity);
          const cropCategory = getCropCategory(item.crop_type);
          const isVegetable = cropCategory === 'vegetable';

          return (
            <View style={[styles.rowCard, isExpanded && styles.expandedCardBorder]}>
              {/* Card Header - Clickable */}
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => setExpandedRowId(isExpanded ? null : item.id)}
                style={styles.cardHeaderPressable}
              >
                <View style={styles.cardLeftContent}>
                  <Text style={styles.cropTitle}>{item.crop_type}</Text>
                  <Text style={styles.metaText}>
                    📅 Planted: {item.planting_date} • Progress: {progress}%
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusTextLabel, { color: statusConfig.text }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={styles.detailsDrawer}>
                  <Text style={styles.drawerSectionTitle}>🌱 Crop Diagnostic Summary</Text>
                  
                  {/* Production Cycle Timelines */}
                  <View style={[styles.detailBox, isVegetable && styles.vegetableDetailBox]}>
                    <Text style={styles.detailLabel}>⏱️ Production Cycle Timelines:</Text>
                    <Text style={styles.detailValue}>
                      • Expected Maturity: {item.days_to_maturity} Days (~{Math.round(item.days_to_maturity / 30)} Months){'\n'}
                      • Estimated Harvest Target: {harvestDate}
                    </Text>
                  </View>

                  {/* Companion Information */}
                  <View style={[styles.detailBox, isVegetable && styles.vegetableDetailBox]}>
                    <Text style={styles.detailLabel}>🤝 Companion Planting Guide:</Text>
                    <Text style={styles.detailValue}>
                      {item.companion_crop || 'No companions registered'}
                    </Text>
                  </View>

                  {/* Soil Notes */}
                  <View style={[styles.detailBox, isVegetable && styles.vegetableDetailBox]}>
                    <Text style={styles.detailLabel}>🪓 Soil Conditioning Logs:</Text>
                    <Text style={styles.detailValue}>
                      {item.soil_notes || 'No soil logs recorded yet'}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <Text style={styles.drawerSectionTitle}>🛠️ Actions</Text>
                  <View style={styles.actionButtonGroup}>
                    {item.harvest_status !== 'growing' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.growBtn]} 
                        onPress={() => handleUpdateStatus(item.id, 'growing')}
                      >
                        <Text style={styles.actionBtnText}>🌿 Growing</Text>
                      </TouchableOpacity>
                    )}
                    {item.harvest_status !== 'harvesting' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.harvestBtn]} 
                        onPress={() => handleUpdateStatus(item.id, 'harvesting')}
                      >
                        <Text style={styles.actionBtnText}>🌾 Harvest</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.clearBtn]} 
                      onPress={() => handleRemoveRow(item.id)}
                    >
                      <Text style={styles.actionBtnText}>🗑️ Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        
        ListFooterComponent={
          <View style={styles.footerFormContainer}>
            <Text style={styles.formSectionTitle}>🌱 Plant New Cultivation Row</Text>
            
            {/* Crop Type Input with Autocomplete */}
            <View style={styles.inputWrapperContainer}>
              <TextInput 
                style={styles.inputField} 
                placeholder="Crop Variety Name (e.g. Tomato, Corn)" 
                value={cropType} 
                onChangeText={setCropType} 
              />
              
              {showDropdown && suggestions.length > 0 && (
                <View style={styles.dropdownFloatingContainer}>
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={item.id || index}
                      style={styles.dropdownItemRow}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <View>
                        <Text style={styles.dropdownItemName}>🌱 {item.name}</Text>
                        <Text style={styles.dropdownItemMeta}>
                          Companion: {item.companion || 'None specified'}
                        </Text>
                      </View>
                      <Text style={styles.dropdownItemMeta}>
                        ⏱️ {item.default_dtm} days
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TextInput 
              style={styles.inputField} 
              placeholder="Days to Maturity (e.g. 75)" 
              keyboardType="numeric" 
              value={dtm} 
              onChangeText={setDtm} 
            />
            
            <TextInput 
              style={styles.inputField} 
              placeholder="Companion Crops (e.g. Basil, Carrots)" 
              value={companion} 
              onChangeText={setCompanion} 
            />
            
            <TextInput 
              style={[styles.inputField, styles.multilineInput]} 
              placeholder="Variety Specs / Soil Notes (Auto-fills on choice selection)" 
              multiline={true} 
              numberOfLines={3} 
              value={soilNotes} 
              onChangeText={setSoilNotes} 
            />
            
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handlePlantRow}
            >
              <Text style={styles.submitText}>🌱 Commit New Planting Event</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FAFAFA' 
  },
  loadingText: { 
    marginTop: 12, 
    color: '#4F4F4F', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  
  // Header
  headerBlock: { 
    backgroundColor: '#E8F5E9', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#C8E6C9', 
    marginBottom: 8 
  },
  titleHeader: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2E7D32' 
  },
  subtitleHeader: { 
    fontSize: 13, 
    color: '#2E7D32', 
    marginTop: 4, 
    opacity: 0.8 
  },
  
  // Status
  statusBox: { 
    margin: 16, 
    padding: 12, 
    backgroundColor: '#E8F5E9', 
    borderRadius: 8, 
    borderLeftWidth: 4, 
    borderLeftColor: '#2E7D32' 
  },
  statusText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#1B5E20' 
  },
  
  // Section
  sectionLabel: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2E7D32', 
    marginHorizontal: 16, 
    marginTop: 12, 
    marginBottom: 8 
  },
  
  // Empty State
  emptyStateBox: { 
    padding: 30, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderStyle: 'dashed', 
    marginHorizontal: 16, 
    marginBottom: 8 
  },
  emptyStateText: { 
    color: '#2E7D32', 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  emptyStateSubtext: { 
    color: '#757575', 
    fontSize: 13, 
    marginTop: 4, 
    textAlign: 'center' 
  },
  
  // Cards
  rowCard: { 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 16, 
    marginVertical: 6, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  expandedCardBorder: { 
    borderColor: '#2E7D32', 
    borderWidth: 2 
  },
  cardHeaderPressable: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardLeftContent: { 
    flex: 1, 
    marginRight: 12 
  },
  cropTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#212121' 
  },
  metaText: { 
    fontSize: 12, 
    color: '#757575', 
    marginTop: 4 
  },
  
  // Status Badge
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 20, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  statusTextLabel: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
  
  // Progress Bar
  progressBarBackground: { 
    height: 8, 
    backgroundColor: '#E8E8E8', 
    borderRadius: 4, 
    marginTop: 12, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#2E7D32', 
    borderRadius: 4 
  },
  
  // Details Drawer
  detailsDrawer: { 
    marginTop: 14, 
    paddingTop: 14, 
    borderTopWidth: 1, 
    borderTopColor: '#E8E8E8' 
  },
  drawerSectionTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#555', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.3 
  },
  detailBox: { 
    backgroundColor: '#F9FAFB', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#F0F0F0' 
  },
  vegetableDetailBox: {
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9'
  },
  detailLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#718096', 
    marginBottom: 2 
  },
  detailValue: { 
    fontSize: 14, 
    color: '#2D3748', 
    fontWeight: '500' 
  },
  
  // Action Buttons
  actionButtonGroup: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 4, 
    marginBottom: 4, 
    flexWrap: 'wrap' 
  },
  actionBtn: { 
    flex: 1, 
    minWidth: 70, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  growBtn: { 
    backgroundColor: '#E3F2FD', 
    borderWidth: 1, 
    borderColor: '#1565C0' 
  },
  harvestBtn: { 
    backgroundColor: '#FFF3E0', 
    borderWidth: 1, 
    borderColor: '#E65100' 
  },
  clearBtn: { 
    backgroundColor: '#FFEBEE', 
    borderWidth: 1, 
    borderColor: '#D32F2F' 
  },
  actionBtnText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#37474F' 
  },
  
  // Form
  footerFormContainer: { 
    padding: 16, 
    paddingBottom: 80, 
    marginTop: 8 
  },
  formSectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2E7D32', 
    marginBottom: 16 
  },
  inputWrapperContainer: { 
    position: 'relative', 
    zIndex: 999, 
    marginBottom: 4 
  },
  inputField: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#D0D0D0', 
    borderRadius: 8, 
    padding: 14, 
    marginBottom: 12, 
    fontSize: 15, 
    color: '#212121' 
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top'
  },
  
  // Dropdown
  dropdownFloatingContainer: { 
    position: 'absolute', 
    top: 52, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#2E7D32', 
    maxHeight: 220, 
    zIndex: 1000, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8 
  },
  dropdownItemRow: { 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  dropdownItemName: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#212121' 
  },
  dropdownItemMeta: { 
    fontSize: 12, 
    color: '#757575', 
    marginTop: 2 
  },
  
  // Submit Button
  submitButton: { 
    backgroundColor: '#2E7D32', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3 
  },
  submitText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});