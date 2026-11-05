import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/hooks/useAuth'
import { useTheme } from '../../src/hooks/useTheme'

// Pestañas principales de la app. Cada módulo agrega aquí su pestaña.
export default function TabsLayout() {
  const { colors, fonts } = useTheme()
  const { user } = useAuth()

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.bold, color: colors.text },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semibold },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Postulaciones',
          //Solo los freelancers postulan; para los demás la pestaña se oculta
          href: user?.rol === 'FREELANCER' ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="paper-plane-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contratos',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
