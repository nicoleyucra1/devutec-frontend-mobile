import { useCallback, useEffect, useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { router } from 'expo-router'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { invitationService } from '../../services/invitationService'
import { useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget } from '../../utils/format'

// Inicio del estudiante: clientes que quieren volver a trabajar con él. Tiene 48 horas para postular.
export default function InvitationsCard() {
  const styles = useThemedStyles(createStyles)
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    invitationService
      .mine()
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (!items.length) return null

  const decline = async (invitation) => {
    setBusyId(invitation.projectId)
    try {
      await invitationService.decline(invitation.projectId)
      Alert.alert('Listo', `«${invitation.projectTitle}» ya está abierto para otros estudiantes.`)
      load()
    } catch (err) {
      Alert.alert('No se pudo', errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <View style={styles.card} accessibilityLabel="Invitaciones">
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim="celebra" size={30} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>TE INVITARON</Text>
          <Text style={styles.title}>
            {items.length === 1 ? 'Un cliente quiere volver a trabajar contigo' : `${items.length} clientes quieren volver a trabajar contigo`}
          </Text>
        </View>
      </View>
      {items.map((invitation) => (
        <View key={invitation.projectId} style={styles.item}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {invitation.projectTitle}
          </Text>
          <Text style={styles.muted}>
            {invitation.clientName} · presupuesto {formatBudget(invitation.budget)}
          </Text>
          <Text style={styles.hours}>
            ⏳ Es solo para ti por {invitation.hoursLeft === 1 ? '1 hora' : `${invitation.hoursLeft} horas`} más
          </Text>
          <View style={styles.actions}>
            <PrimaryButton
              title="No puedo"
              variant="secondary"
              onPress={() => decline(invitation)}
              loading={busyId === invitation.projectId}
              style={{ flex: 1 }}
            />
            <PrimaryButton title="Ver y postular" onPress={() => router.push(`/projects/${invitation.projectId}`)} style={{ flex: 1 }} />
          </View>
        </View>
      ))}
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.accentLight, borderRadius: 20, padding: 18, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 2 },
  item: { backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 4 },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  hours: { fontFamily: fonts.semibold, fontSize: 13, color: colors.pending, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
})
