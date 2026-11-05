import { useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ProjectCard from '../../src/components/projects/ProjectCard'
import StateView from '../../src/components/projects/StateView'
import { colors } from '../../src/theme'
import { useDebounce } from '../../src/hooks/useDebounce'
import { useProjectFeed } from '../../src/hooks/useProjectFeed'
import { useAuth } from '../../src/hooks/useAuth'
import { STATUS_LABELS } from '../../src/utils/format'

const STATUS_FILTERS = [['', 'Todos'], ...Object.entries(STATUS_LABELS)]

// Explorar proyectos: búsqueda con debounce, filtro por estado y scroll infinito
export default function ProjectsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const feed = useProjectFeed({ search: debouncedSearch, status })

  const isFiltered = Boolean(debouncedSearch.trim() || status)
  const clearFilters = () => {
    setSearch('')
    setStatus('')
  }

  const renderEmpty = () => {
    if (feed.loading) return <StateView loading message="Cargando proyectos..." />
    if (feed.error) return <StateView title="No se pudo cargar" message={feed.error} actionLabel="Reintentar" onAction={feed.retry} />
    return isFiltered ? (
      <StateView title="Sin resultados" message="Prueba con otras palabras o quita el filtro." actionLabel="Limpiar filtros" onAction={clearFilters} />
    ) : (
      <StateView title="Todavía no hay proyectos" message="Cuando alguien publique uno, aparecerá aquí." />
    )
  }

  const renderFooter = () => {
    if (feed.loadingMore) return <ActivityIndicator style={styles.footer} color={colors.primary} />
    if (feed.error && feed.items.length > 0) {
      return (
        <Pressable onPress={feed.retry} style={styles.footer}>
          <Text style={styles.retry}>{feed.error} Toca para reintentar.</Text>
        </Pressable>
      )
    }
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#9ca3af"
            placeholder="Buscar por título o descripción"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Buscar proyectos"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} accessibilityLabel="Borrar búsqueda" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {STATUS_FILTERS.map(([value, label]) => {
            const active = status === value
            return (
              <Pressable
                key={label}
                onPress={() => setStatus(value)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      <FlatList
        data={feed.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProjectCard project={item} onPress={() => router.push(`/projects/${item.id}`)} />}
        contentContainerStyle={feed.items.length === 0 ? styles.emptyList : styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.4}
        refreshing={feed.refreshing}
        onRefresh={feed.refresh}
        keyboardShouldPersistTaps="handled"
      />

      {user?.rol === 'CLIENT' ? (
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/projects/new')}
          accessibilityRole="button"
          accessibilityLabel="Publicar proyecto"
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  filters: { backgroundColor: '#fff', borderBottomColor: colors.border, borderBottomWidth: 1, gap: 10, paddingTop: 12 },
  searchBox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
  searchInput: { color: colors.text, flex: 1, fontSize: 15, paddingVertical: 10 },
  chips: { gap: 8, paddingBottom: 12, paddingHorizontal: 16 },
  chip: { borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 96 },
  emptyList: { flexGrow: 1 },
  separator: { height: 12 },
  footer: { padding: 16 },
  retry: { color: colors.error, textAlign: 'center' },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    bottom: 24,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 56,
  },
})
