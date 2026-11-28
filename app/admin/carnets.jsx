import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { Stack } from 'expo-router'
import PropTypes from 'prop-types'
import PrimaryButton from '../../src/components/PrimaryButton'
import StateView from '../../src/components/projects/StateView'
import { useAuth } from '../../src/hooks/useAuth'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { carnetAdminService } from '../../src/services/carnetAdminService'
import { errorMessage } from '../../src/utils/errorMessage'
import { formatWhen } from '../../src/utils/format'

// Foto del carnet (privada: se pide con el token)
function CarnetPhoto({ userId }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [uri, setUri] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    carnetAdminService
      .imageDataUri(userId)
      .then((value) => active && setUri(value))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [userId])

  if (failed) return <Text style={styles.muted}>No se pudo cargar la foto.</Text>
  if (!uri) return <ActivityIndicator color={colors.accent} style={{ marginVertical: 30 }} />
  return <Image source={{ uri }} style={styles.photo} resizeMode="contain" accessibilityLabel="Foto del carnet" />
}

CarnetPhoto.propTypes = { userId: PropTypes.number.isRequired }

// Admin: carnets universitarios por revisar (segunda verificación, además del correo .edu.pe)
export default function AdminCarnetsScreen() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [reasons, setReasons] = useState({})
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    setError(null)
    carnetAdminService
      .list('PENDING')
      .then(setItems)
      .catch((err) => setError(errorMessage(err)))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const decide = async (item, approved) => {
    const reason = (reasons[item.userId] ?? '').trim()
    if (!approved && !reason) {
      Alert.alert('Falta el motivo', 'Escribe por qué lo rechazas (por ejemplo, «La foto está borrosa»).')
      return
    }
    setBusyId(item.userId)
    try {
      await carnetAdminService.review(item.userId, { approved, reason })
      Alert.alert('Listo', approved ? `Carnet de ${item.nombre} aprobado.` : `Carnet de ${item.nombre} rechazado.`)
      load()
    } catch (err) {
      Alert.alert('No se pudo', errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  if (user?.rol !== 'ADMIN') {
    return <StateView title="Solo para administradores" message="Esta pantalla es para el equipo de DEVUTEC." />
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTransparent: false, title: 'Carnets' }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.kicker}>VERIFICACIÓN</Text>
        <Text style={styles.h1}>Carnets por revisar</Text>
        <Text style={styles.muted}>
          Revisa que el carnet se lea y que el nombre coincida con la cuenta. Así es más difícil duplicar cuentas.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!items && !error ? <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} /> : null}
        {items && items.length === 0 ? <Text style={[styles.muted, { marginTop: 24 }]}>No hay carnets por revisar. 🎉</Text> : null}

        {items?.map((item) => (
          <View key={item.userId} style={styles.card}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.muted}>{item.email}</Text>
            <Text style={styles.muted}>
              {item.universidad || 'Universidad sin completar'} · subido {formatWhen(item.submittedAt)}
            </Text>
            <Text style={[styles.badge, item.universityEmail ? styles.badgeOk : styles.badgeNo]}>
              {item.universityEmail ? '🎓 Correo .edu.pe' : 'Sin correo .edu.pe'}
            </Text>
            <CarnetPhoto userId={item.userId} />
            <TextInput
              value={reasons[item.userId] ?? ''}
              onChangeText={(text) => setReasons((prev) => ({ ...prev, [item.userId]: text }))}
              placeholder="Motivo si lo rechazas (por ejemplo, la foto está borrosa)"
              placeholderTextColor={colors.muted}
              maxLength={200}
              style={styles.input}
            />
            <View style={styles.actions}>
              <PrimaryButton title="Rechazar" variant="secondary" onPress={() => decide(item, false)} disabled={busyId !== null} style={{ flex: 1 }} />
              <PrimaryButton title="Aprobar" onPress={() => decide(item, true)} loading={busyId === item.userId} disabled={busyId !== null} style={{ flex: 1 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  )
}

const createStyles = ({ colors, fonts }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60, gap: 8 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.muted },
  h1: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, marginTop: 12 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 6, marginTop: 14 },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontFamily: fonts.semibold, fontSize: 12, overflow: 'hidden', marginTop: 4 },
  badgeOk: { backgroundColor: colors.accentLight, color: colors.accent },
  badgeNo: { backgroundColor: colors.background, color: colors.muted },
  photo: { width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.background, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
})
