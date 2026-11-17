import { useState } from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AdminHome from '../../src/components/home/AdminHome'
import ClientHome from '../../src/components/home/ClientHome'
import FreelancerHome from '../../src/components/home/FreelancerHome'
import HomeHeader from '../../src/components/home/HomeHeader'
import { useAuth } from '../../src/hooks/useAuth'
import { useThemedStyles } from '../../src/hooks/useTheme'
import { greeting } from '../../src/utils/format'

// Inicio (mockup M2): saludo y el resumen de cada rol. El cliente ve su dinero en garantía y lo que tiene
// que revisar; el freelancer, lo que cobró y sus contratos en curso; el admin, los pagos de toda la plataforma.
export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const styles = useThemedStyles(createStyles)
  // Al jalar hacia abajo cambia la key: el resumen se vuelve a montar y pide sus datos otra vez
  const [refreshKey, setRefreshKey] = useState(0)
  const firstName = (user.nombre ?? user.email).split(' ')[0]
  const isFreelancer = user.rol === 'FREELANCER'

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => setRefreshKey((key) => key + 1)} />}
    >
      <HomeHeader
        name={user.nombre ?? user.email}
        avatarUrl={user.avatarUrl}
        title={isFreelancer ? `Hola, ${firstName}.` : `${greeting(new Date())}, ${firstName}.`}
        onScan={() => router.push('/scan')}
      />
      {isFreelancer ? <FreelancerHome key={refreshKey} userId={user.id} /> : null}
      {user.rol === 'CLIENT' ? <ClientHome key={refreshKey} /> : null}
      {user.rol === 'ADMIN' ? <AdminHome key={refreshKey} /> : null}
    </ScrollView>
  )
}

const createStyles = ({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 110 },
})
