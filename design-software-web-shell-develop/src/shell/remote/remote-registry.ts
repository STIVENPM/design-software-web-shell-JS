import type { ComponentType, LazyExoticComponent } from 'react';
import type {
  AcademicManagementMfeProps,
  ActorsMfeProps,
  AuditMfeProps,
  DocumentMfeProps,
  IamMfeProps,
  MonitoringMfeProps,
  ReferenceDataMfeProps,
  SchedulingMfeProps,
  TrainingEnvironmentMfeProps,
} from '@sena/frontend-platform';

export type RemoteDomain =
  | 'iam'
  | 'scheduling'
  | 'academic-management'
  | 'training-environment'
  | 'reference-data'
  | 'actors'
  | 'monitoring'
  | 'document'
  | 'audit';

export type FederationName =
  | 'iamMfe'
  | 'schedulingMfe'
  | 'academicManagementMfe'
  | 'trainingEnvironmentMfe'
  | 'referenceDataMfe'
  | 'actorsMfe'
  | 'monitoringMfe'
  | 'documentMfe'
  | 'auditMfe';

export type RemoteManifest = Record<FederationName, string>;

export type RemotePropsByDomain = {
  iam: IamMfeProps;
  scheduling: SchedulingMfeProps;
  'academic-management': AcademicManagementMfeProps;
  'training-environment': TrainingEnvironmentMfeProps;
  'reference-data': ReferenceDataMfeProps;
  actors: ActorsMfeProps;
  monitoring: MonitoringMfeProps;
  document: DocumentMfeProps;
  audit: AuditMfeProps;
};

export type RemoteModule<Props> = { default: ComponentType<Props> };

export interface RemoteDefinition<Domain extends RemoteDomain = RemoteDomain> {
  domain: Domain;
  federationName: FederationName;
  /** Prefijo de ruta que el shell monta para este dominio. */
  basePath: string;
  importRemote: () => Promise<RemoteModule<RemotePropsByDomain[Domain]>>;
}

export type AnyRemoteDefinition = {
  [Domain in RemoteDomain]: RemoteDefinition<Domain>;
}[RemoteDomain];

/**
 * E2: el shell declara una ruta comodín por dominio y resuelve la URL del remote
 * desde `remotes.<env>.json`. Ninguna URL queda hardcodeada en el código.
 */
export const REMOTE_DEFINITIONS: readonly AnyRemoteDefinition[] = [
  { domain: 'iam', federationName: 'iamMfe', basePath: '/iam', importRemote: () => import('iamMfe/App') },
  {
    domain: 'scheduling',
    federationName: 'schedulingMfe',
    basePath: '/scheduling',
    importRemote: () => import('schedulingMfe/App'),
  },
  {
    domain: 'academic-management',
    federationName: 'academicManagementMfe',
    basePath: '/academic-management',
    importRemote: () => import('academicManagementMfe/App'),
  },
  {
    domain: 'training-environment',
    federationName: 'trainingEnvironmentMfe',
    basePath: '/training-environment',
    importRemote: () => import('trainingEnvironmentMfe/App'),
  },
  {
    domain: 'reference-data',
    federationName: 'referenceDataMfe',
    basePath: '/reference-data',
    importRemote: () => import('referenceDataMfe/App'),
  },
  { domain: 'actors', federationName: 'actorsMfe', basePath: '/actors', importRemote: () => import('actorsMfe/App') },
  {
    domain: 'monitoring',
    federationName: 'monitoringMfe',
    basePath: '/monitoring',
    importRemote: () => import('monitoringMfe/App'),
  },
  {
    domain: 'document',
    federationName: 'documentMfe',
    basePath: '/document',
    importRemote: () => import('documentMfe/App'),
  },
  { domain: 'audit', federationName: 'auditMfe', basePath: '/audit', importRemote: () => import('auditMfe/App') },
];

/**
 * Registro de remotes. `federation` usa los `lazy()` reales de Module Federation;
 * `mock` sirve stubs para validar el chrome sin tener los remotes construidos.
 */
export interface RemoteRegistry {
  readonly kind: 'mock' | 'federation';
  get<Domain extends RemoteDomain>(domain: Domain): LazyExoticComponent<ComponentType<RemotePropsByDomain[Domain]>>;
  definition<Domain extends RemoteDomain>(domain: Domain): RemoteDefinition<Domain>;
}

export const isRemoteDomain = (value: string): value is RemoteDomain =>
  REMOTE_DEFINITIONS.some((definition) => definition.domain === value);
