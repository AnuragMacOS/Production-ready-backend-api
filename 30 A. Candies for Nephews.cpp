#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using vi = vector<int>;
using vll = vector<ll>;
using pii = pair<int, int>;

#define all(x) (x).begin(), (x).end()
#define sz(x) ((int)(x).size())
#define pb push_back
#define forn(i,n)  for(int i=0;i<n;i++)


void solve() {
    int n;
    cin >> n;
    
    int rem = n % 3;
    
    if (rem == 0) {
        cout << 0 << endl;
    } else {
        cout << 3 - rem << endl;
    }
}
    


int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t;
    while (t--) {
        solve();
    }
    
    return 0;
}