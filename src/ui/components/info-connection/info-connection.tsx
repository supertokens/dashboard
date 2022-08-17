type InfoConnectionProps = {
  connectionURI: string
}

const DEMO_CONNECTION_URIS = ['try.supertokens.io', 'try.supertokens.com']

const isDemoConnectionUri = (connectionURI: string) => {
  return DEMO_CONNECTION_URIS.some((domains) => connectionURI.includes(domains))
}
export const InfoConnection: React.FC<InfoConnectionProps> = ({ connectionURI }) => (
  <>
    {isDemoConnectionUri(connectionURI) && (
      <div className='block-info block-medium block-info-connection text-small'>
        <p className='text-bold'>
          connectionURI set to <span className='block-info block-snippet'>{connectionURI}</span>
        </p>
        <p>You are connected to a core that uses SuperTokens instances for demo purposes only.</p>
      </div>
    )}
  </>
)

export default InfoConnection
