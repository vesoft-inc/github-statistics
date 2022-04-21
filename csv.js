const ObjectToCsv = require('objects-to-csv');
const axios = require('axios');

const repos = [
    {
        'url': 'ava-labs/avalanchejs',
        'eco': 'avalanche',
        'name': 'avalanchejs'
    },

    {
        'url': 'CosmWasm/cosmwasm',
        'eco': 'cosmos',
        'name': 'cosmwasm'
    },
    {
        'url': 'cosmos/cosmos-sdk',
        'eco': 'cosmos',
        'name': 'cosmos-sdk'
    },

    {
        'url': 'terra-money/terra.js',
        'eco': 'terra',
        'name': 'terra.js'
    },
    {
        'url': 'terra-money/terra.js',
        'eco': 'terra',
        'name': 'terra.js'
    },

    {
        'url': 'solana-labs/solana-web3.js',
        'eco': 'solana',
        'name': 'solana-web3.js'
    },


    {
        'url': 'ethers-io/ethers.js',
        'eco': 'ethereum',
        'name': 'ethers.js'
    },
    {
        'url': 'ChainSafe/web3.js',
        'eco': 'ethereum',
        'name': 'web3.js'
    },
    {
        'url': 'OpenZeppelin/openzeppelin-contracts',
        'eco': 'ethereum',
        'name': 'openzeppelin-contracts'
    },
    {
        'url': 'ethereum/web3.py',
        'eco': 'ethereum',
        'name': 'web3.py'
    },
    {
        'url': 'trufflesuite/ganache',
        'eco': 'ethereum',
        'name': 'ganache'
    },
    {
        'url': 'trufflesuite/truffle',
        'eco': 'ethereum',
        'name': 'truffle'
    },
    {
        'url': 'NomicFoundation/hardhat',
        'eco': 'ethereum',
        'name': 'hardhat'
    },
    {
        'url': 'eth-brownie/brownie',
        'eco': 'ethereum',
        'name': 'brownie'
    }
];

let csv_datas = [];


(async () => {
    const the_data = {};
    for (let i = 0; i < repos.length; i++) {
        const { data } = await axios.get(`https://api.github.com/repos/${repos[i].url}`, {
            headers: {
                "Authorization": "token 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"
            }
        });

        // commit
        const {  headers:commit } = await axios.get(`https://api.github.com/repos/${data.full_name}/commits?per_page=1&page=1`, {
            headers: {
                "Authorization": "token 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"
            }
        });

        // issue

        const { headers: issue } = await axios.get(`https://api.github.com/repos/${data.full_name}/issues?state=closed&per_page=1&page=1`, {
            headers: {
                "Authorization": "token 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"
            }
        });

        // pull request count

        const {headers:pr_count_1} = await axios.get(`https://api.github.com/repos/${data.full_name}/pulls?state=open&per_page=1&page=1`, {
            headers: {
                "Authorization": "token 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"
            }
        });
        const {headers:pr_count_2} = await axios.get(`https://api.github.com/repos/${data.full_name}/pulls?state=closed&per_page=1&page=1`, {
            headers: {
                "Authorization": "token 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"
            }
        });
        console.log(Number(pr_count_1.link.split(',')[1].split("page=")[2].split(">")[0] ) + Number(pr_count_2.link.split(',')[1].split("page=")[2].split(">")[0]));
        the_data.repo_name = data.full_name.split("/")[0];
        the_data.date = data.created_at.slice(0, 10);
        the_data.fork_count = data.forks_count;
        the_data.star_count = data.stargazers_count;
        the_data.issue_count = issue.link.split(',')[1].split("page=")[2].split(">")[0] + data.open_issues_count;
        the_data.pr_count = Number(pr_count_1.link.split(',')[1].split("page=")[2].split(">")[0] ) + Number(pr_count_2.link.split(',')[1].split("page=")[2].split(">")[0]);
        the_data.commit_count = commit.link.split('page=')[4].split(">")[0];
        csv_datas = [...csv_datas, { ...the_data }];

    }

    const csv = new ObjectToCsv(csv_datas);

    // save to file

    await csv.toDisk('./client_2.csv');

    // csv has exported

    console.log('csv has exported');
    
})();