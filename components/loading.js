import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'

export default function RandomLoadingIcon() {
    if (Math.random() < 0.5) {
      return <> 
            <div>
              <div style={{
                    display:"flex",
                    justifyContent:"center",
                }}>
                  <Image
                    priority
                    src="/images/loading.gif"
                    className={utilStyles.borderCircle}
                    height={100}
                    width={100}
                    />
              </div>
            </div>
            </>
    }
    return <> 
          <div>
            <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                <Image
                  priority
                  src="/images/loadingcolor.gif"
                  className={utilStyles.borderCircle}
                  height={150}
                  width={200}
                  />
            </div>
          </div>
          </>
  }